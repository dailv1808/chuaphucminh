document.addEventListener('alpine:init', () => {
  Alpine.data('checkedInData', () => ({
    registrations: [],
    filteredRegistrations: [],
    searchQuery: '',
    showDetail: false,
    selectedRegistration: null,
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
        const response = await fetch('http://192.168.0.200:8000/api/registration/');
        if (!response.ok) throw new Error('Lỗi kết nối mạng');
        
        const data = await response.json();
        this.registrations = data.filter(reg => reg.status === 'checked_in');
        this.filteredRegistrations = [...this.registrations];
      } catch (error) {
        console.error('Lỗi khi tải danh sách đăng ký:', error);
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

    calculateRemainingDays(endDate) {
      if (!endDate) return 'N/A';
      const today = new Date();
      const end = new Date(endDate);
      const diffTime = end - today;
      const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (remainingDays < 0) return 'Đã hết hạn';
      if (remainingDays === 0) return 'Hôm nay';
      return `${remainingDays} ngày`;
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
        reg.fullname.toLowerCase().includes(query) ||
        reg.username.includes(query) ||
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

    async checkoutRegistration(id) {
      try {
        const response = await fetch(`http://192.168.0.200:8000/api/registration/${id}/checkout/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) throw new Error('Check-out thất bại');
        
        this.showNotificationMessage('Check-out thành công', 'success');
        this.fetchRegistrations();
      } catch (error) {
        console.error('Lỗi check-out:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi check-out', 'error');
      }
    },

    downloadTemporaryStay(id) {
      console.log('Tải file tạm trú cho ID:', id);
      this.showNotificationMessage('Đang tải file tạm trú...', 'success');
    }
  }));
});
