document.addEventListener('alpine:init', () => {
  Alpine.data('pendingData', () => ({
    registrations: [],
    filteredRegistrations: [],
    searchQuery: '',
    showDetail: false,
    showRejectReasonModal: false,
    selectedRegistration: null,
    selectedRejectId: null,
    rejectReason: '',
    isLoading: true,
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',

    init() {
      this.fetchRegistrations();
    },

    async fetchRegistrations() {
      try {
        this.isLoading = true;

        const response = await fetch('https://api.chuaphucminh.xyz/api/registration/', {
          headers: {
            //'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });


        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        this.registrations = data.filter(reg => reg.status === 'pending');
        this.filteredRegistrations = [...this.registrations];
      } catch (error) {
        console.error('Error fetching registrations:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi tải dữ liệu', 'error');
      } finally {
        this.isLoading = false;
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

    formatDateTime(dateTimeString) {
      if (!dateTimeString) return 'N/A';
      const date = new Date(dateTimeString);
      return date.toLocaleString('vi-VN');
    },

    formatStatus(status) {
      const statusMap = {
        'pending': { text: 'Chờ duyệt', color: 'bg-amber-100 text-amber-800' },
        'approved': { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
        'rejected': { text: 'Đã từ chối', color: 'bg-red-100 text-red-800' }
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
        reg.fullname.toLowerCase().includes(query) ||
        reg.phone_number.includes(query) ||
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
    },

    showRejectModal(id) {
      this.selectedRejectId = id;
      this.rejectReason = '';
      this.showRejectReasonModal = true;
      this.showDetail = false;
    },

    async approveRegistration(id) {
      try {

        const token = localStorage.getItem('access_token'); //Them moi

        const response = await fetch(`https://api.chuaphucminh.xyz/api/registration/${id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json', // THem moi
          },
          body: JSON.stringify({
            status: 'approved'
          })
        });
        
        if (!response.ok) throw new Error('Approval failed');
        
        this.showNotificationMessage('Đã duyệt thành công', 'success');
        this.fetchRegistrations();
        this.showDetail = false;
      } catch (error) {
        console.error('Approval error:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi duyệt', 'error');
      }
    },

    async rejectRegistration() {
      if (!this.rejectReason.trim()) {
        this.showNotificationMessage('Vui lòng nhập lý do từ chối', 'error');
        return;
      }
      
      try {
        const token = localStorage.getItem('access_token'); // Them moi
        const response = await fetch(`https://api.chuaphucminh.xyz/api/registration/${this.selectedRejectId}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`, //themmoi
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'rejected',
            reject_reason: this.rejectReason
          })
        });
        
        if (!response.ok) throw new Error('Rejection failed');
        
        this.showNotificationMessage('Đã từ chối thành công', 'success');
        this.fetchRegistrations();
        this.showRejectReasonModal = false;
      } catch (error) {
        console.error('Rejection error:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi từ chối', 'error');
      }
    }
  }));
});
