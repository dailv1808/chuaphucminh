import { getApiUrl } from './config.js';

document.addEventListener('alpine:init', () => {
  Alpine.data('checkedOutData', () => ({
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
        const response = await fetch('${window.API_BASE_URL}/api/registration/');
        if (!response.ok) throw new Error('Lỗi kết nối mạng');
        
        const data = await response.json();
        this.registrations = data
          .filter(reg => reg.status === 'checked_out')
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        
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

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },

    formatStatus(status) {
      const statusMap = {
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
        (reg.email && reg.email.toLowerCase().includes(query))
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
