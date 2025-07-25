document.addEventListener('alpine:init', () => {
  Alpine.data('approvedData', () => ({
    registrations: [],
    filteredRegistrations: [],
    searchQuery: '',
    showDetail: false,
    selectedRegistration: null,
    isLoading: true,
    isDownloading: false,
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',
    showKutiModal: false,
    availableKutis: [],
    selectedKutiId: null,
    currentRegistrationId: null,

    init() {
      this.fetchRegistrations();
    },

    async fetchRegistrations() {
      try {
        this.isLoading = true;
        const response = await fetch('http://192.168.0.200:8000/api/registration/');
        if (!response.ok) throw new Error('Lỗi kết nối mạng');
        
        const data = await response.json();
        this.registrations = data.filter(reg => reg.status === 'approved');
        this.filteredRegistrations = [...this.registrations];
      } catch (error) {
        console.error('Lỗi khi tải danh sách đăng ký:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi tải dữ liệu', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAvailableKutis(gender) {
      try {
	const token = localStorage.getItem('access_token');
        const response = await fetch('http://192.168.0.200:8000/api/kuti/', {
	  headers: {
	    'Authorization': `Bearer ${token}`, 
	    'Content-Type': 'application/json' 
	  }
	});
        if (!response.ok) throw new Error('Lỗi kết nối mạng');
        
        const data = await response.json();
        this.availableKutis = data.filter(kuti => 
          kuti.is_available && 
          (kuti.gender_allowed === 'All' || kuti.gender_allowed === gender)
        );
      } catch (error) {
        console.error('Lỗi khi tải danh sách Kuti:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi tải danh sách Kuti', 'error');
      }
    },

    async openCheckInModal(registration) {
      this.currentRegistrationId = registration.id;
      await this.fetchAvailableKutis(registration.gender);
      this.showKutiModal = true;
    },

    async confirmCheckIn() {
      if (!this.selectedKutiId) {
        this.showNotificationMessage('Vui lòng chọn Kuti', 'error');
        return;
      }

      try {
        const assignResponse = await fetch('http://192.168.0.200:8000/api/kutiassignment/assign/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registration_id: this.currentRegistrationId,
            kuti_id: this.selectedKutiId
          })
        });

        if (!assignResponse.ok) throw new Error('Gán Kuti thất bại');
        const token = localStorage.getItem('access_token');
        const checkInResponse = await fetch(`http://192.168.0.200:8000/api/registration/${this.currentRegistrationId}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'checked_in'
          })
        });
        
        if (!checkInResponse.ok) throw new Error('Check-in thất bại');
        
        this.showNotificationMessage('Check-in thành công', 'success');
        this.showKutiModal = false;
        this.selectedKutiId = null;
        this.fetchRegistrations();
      } catch (error) {
        console.error('Lỗi check-in:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi check-in', 'error');
      }
    },

    async downloadTemporaryStay(registration) {
      try {
        let regData = registration;
        
        if (this.selectedRegistration && this.selectedRegistration.id === registration.id) {
          regData = this.selectedRegistration;
        }
        else if (!registration.cccd || !registration.fullname) {
          try {
            const response = await fetch(getApiUrl(`/api/registration/${registration.id}/`));
            if (!response.ok) throw new Error('Lỗi khi lấy thông tin chi tiết');
            regData = await response.json();
          } catch (fetchError) {
            console.error('Lỗi khi lấy thông tin:', fetchError);
            this.showRegistrationDetail(registration);
            this.showNotificationMessage('Vui lòng xem thông tin chi tiết trước khi tải', 'info');
            return;
          }
        }

        if (!regData.cccd || !regData.fullname) {
          this.showNotificationMessage('Thông tin CCCD hoặc họ tên bị thiếu', 'error');
          return;
        }

        this.isDownloading = true;
        this.showNotificationMessage('Đang tạo tờ khai tạm trú...', 'info');
        const token = localStorage.getItem('access_token'); 
        const response = await fetch('http://192.168.0.200:8000/api/tamtru/', {
          method: 'POST',
          headers: {
     	    'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: regData.username || '',
            cccd: regData.cccd,
            fullname: regData.fullname,
            gender: regData.gender || 'Nam',
            birthday: regData.birthday || new Date().toISOString().split('T')[0],
            email: regData.email || '',
            address: regData.address || ''
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Lỗi khi tạo tờ khai tạm trú');
        }

        // Lấy filename từ Content-Disposition hoặc tạo mới
        const contentDisposition = response.headers.get('content-disposition');
        let filename = `To_khai_tam_tru_${regData.cccd}.docx`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/"/g, '');
          }
        }

        // Tạo blob từ response và tải xuống
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        // Dọn dẹp
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        }, 100);

        this.showNotificationMessage('Tải tờ khai tạm trú thành công', 'success');
      } catch (error) {
        console.error('Lỗi khi tải tờ khai tạm trú:', error);
        this.showNotificationMessage(error.message || 'Có lỗi xảy ra khi tải tờ khai tạm trú', 'error');
      } finally {
        this.isDownloading = false;
      }
    },

    calculateDuration(startDate, endDate) {
      if (!startDate || !endDate) return 0;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },

    formatStatus(status) {
      const statusMap = {
        'approved': { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
        'checked_in': { text: 'Đã check-in', color: 'bg-purple-100 text-purple-800' },
        'checked_out': { text: 'Đã check-out', color: 'bg-orange-100 text-orange-800' }
      };
      return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    },

    filterRegistrations() {
      if (!this.searchQuery) {
        this.filteredRegistrations = [...this.registrations];
        return;
      }
      
      const query = this.searchQuery.toLowerCase();
      this.filteredRegistrations = this.registrations.filter(reg => 
        (reg.fullname && reg.fullname.toLowerCase().includes(query)) ||
        (reg.username && reg.username.includes(query)) ||
        (reg.cccd && reg.cccd.includes(query)) ||
        (reg.address && reg.address.toLowerCase().includes(query))
      );
    },

    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    },

    showRegistrationDetail(registration) {
      this.selectedRegistration = registration;
      this.showDetail = true;
    }
  }));
});
