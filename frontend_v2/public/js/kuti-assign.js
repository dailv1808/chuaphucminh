document.addEventListener('alpine:init', () => {
  Alpine.data('kutiAssignData', () => ({
    kutis: [],
    registrations: [],
    filteredKutis: [],
    searchQuery: '',
    isLoading: true,
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',

    init() {
      this.fetchData();
    },

    async fetchData() {
      try {
        this.isLoading = true;
        
        // Fetch kutis
        
	const token = localStorage.getItem('access_token');

	const kutisResponse = await fetch('http://192.168.0.200/api/kuti/', {
	  headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
	});
        if (!kutisResponse.ok) {
          throw new Error(`HTTP error! status: ${kutisResponse.status}`);
        }
        this.kutis = await kutisResponse.json();
        console.log('Kutis data:', this.kutis);

        // Fetch registrations
        const registrationsResponse = await fetch('http://192.168.0.200/api/registration/');
        if (!registrationsResponse.ok) {
          throw new Error(`HTTP error! status: ${registrationsResponse.status}`);
        }
        this.registrations = await registrationsResponse.json();
        console.log('Registrations data:', this.registrations);

        this.filteredKutis = [...this.kutis];
      } catch (error) {
        console.error('Error fetching data:', error);
        this.showNotificationMessage(`Có lỗi xảy ra khi tải dữ liệu: ${error.message}`, 'error');
      } finally {
        this.isLoading = false;
      }
    },

    getUserById(id) {
      if (!id) return null;
      const user = this.registrations.find(reg => reg.id === id);
      console.log(`Looking for user ${id}, found:`, user);
      return user || null;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      } catch (e) {
        console.error('Error formatting date:', dateString, e);
        return 'N/A';
      }
    },

    formatDateRange(startDate, endDate) {
      if (!startDate || !endDate) return 'N/A';
      try {
        return `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`;
      } catch (e) {
        console.error('Error formatting date range:', startDate, endDate, e);
        return 'N/A';
      }
    },

    filterKutis() {
      if (!this.searchQuery) {
        this.filteredKutis = [...this.kutis];
        return;
      }
      
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredKutis = this.kutis.filter(kuti => {
        // Check kuti code
        if (kuti.code && kuti.code.toLowerCase().includes(query)) {
          return true;
        }
        
        // Check if has registration and match search
        if (kuti.current_registration) {
          const user = this.getUserById(kuti.current_registration);
          if (user) {
            if (user.fullname && user.fullname.toLowerCase().includes(query)) {
              return true;
            }
            if (user.username && user.username.includes(query)) {
              return true;
            }
          }
        }
        return false;
      });
    },

    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 5000);
    }
  }));
});
