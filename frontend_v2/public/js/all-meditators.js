document.addEventListener('alpine:init', () => {
  Alpine.data('allMeditatorsData', () => ({
    registrations: [],
    filteredRegistrations: [],
    searchQuery: '',
    statusFilter: '',
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
        const response = await fetch('https://api.chuaphucminh.xyz/api/registration/');
        if (!response.ok) throw new Error('Lỗi kết nối mạng');
        
        const data = await response.json();
        this.registrations = data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        this.filteredRegistrations = [...this.registrations];
      } catch (error) {
        console.error('Lỗi khi tải danh sách thiền sinh:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi tải dữ liệu', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    filterRegistrations() {
      const query = this.searchQuery.toLowerCase();
      const status = this.statusFilter;
      
      this.filteredRegistrations = this.registrations.filter(reg => {
        const matchesSearch = 
          reg.fullname.toLowerCase().includes(query) ||
          (reg.email && reg.email.toLowerCase().includes(query));
        
        const matchesStatus = status ? reg.status === status : true;
        
        return matchesSearch && matchesStatus;
      });
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
        'pending': { text: 'Chờ duyệt', color: 'bg-yellow-100 text-yellow-800' },
        'approved': { text: 'Đã duyệt', color: 'bg-green-100 text-green-800' },
        'checked_in': { text: 'Đã check-in', color: 'bg-purple-100 text-purple-800' },
        'checked_out': { text: 'Đã check-out', color: 'bg-orange-100 text-orange-800' },
        'rejected': { text: 'Từ chối', color: 'bg-red-100 text-red-800' }
      };
      return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
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
