document.addEventListener('alpine:init', () => {
  Alpine.data('dashboardData', () => ({
    stats: {
      pendingRegistrations: 0,
      pendingChange: 5.2,
      checkedInMeditators: 0,
      checkedInChange: -2.1,
      tomorrowCheckins: 0,
      tomorrowCheckouts: 0,
      availableKuti: 0,
      totalKuti: 0,
      newQuestions: 0
    },
    latestRegistrations: [],
    latestQuestions: [],
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',
    isLoading: true,

    init() {
      this.fetchAllData();
    },

    async fetchAllData() {
      try {
        this.isLoading = true;
        
        // Fetch all registrations
        const registrationsRes = await fetch('http://192.168.0.200:8000/api/registration/');
        if (registrationsRes.ok) {
          const registrationsData = await registrationsRes.json();
          
          // Filter pending registrations
          const pendingRegistrations = registrationsData.filter(reg => reg.status === 'pending');
          this.stats.pendingRegistrations = pendingRegistrations.length;
          
          // Filter checked-in meditators
          this.stats.checkedInMeditators = registrationsData.filter(reg => reg.status === 'checked_in').length;
          
          // Filter tomorrow's check-ins (approved with start_date = tomorrow)
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          const tomorrowStr = tomorrow.toISOString().split('T')[0];
          this.stats.tomorrowCheckins = registrationsData.filter(reg => 
            reg.status === 'approved' && 
            reg.start_date === tomorrowStr
          ).length;
          
          // Filter tomorrow's check-outs (checked_in with end_date = tomorrow)
          this.stats.tomorrowCheckouts = registrationsData.filter(reg => 
            reg.status === 'checked_in' && 
            reg.end_date === tomorrowStr
          ).length;
          
          // Get latest PENDING registrations (sorted by date)
          this.latestRegistrations = pendingRegistrations
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
        }
        
        // Fetch Kuti status
        const kutiRes = await fetch('http://192.168.0.200:8000/api/kuti/');
        if (kutiRes.ok) {
          const kutiData = await kutiRes.json();
          this.stats.totalKuti = kutiData.length;
          this.stats.availableKuti = kutiData.filter(k => k.is_available).length;
        }
        
        // Fetch latest questions
        const questionsRes = await fetch('http://192.168.0.200:8000/api/questions/');
        if (questionsRes.ok) {
          const questionsData = await questionsRes.json();
          this.stats.newQuestions = questionsData.filter(q => q.status !== 'answered').length;
          this.latestQuestions = questionsData
            .filter(q => q.status !== 'answered')
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 3);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi tải dữ liệu', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },

    formatTimeAgo(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now - date) / 1000);
      
      if (diffInSeconds < 60) return 'vài giây trước';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    },

    calculateDuration(startDate, endDate) {
      if (!startDate || !endDate) return 0;
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },

    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    }
  }));
});
