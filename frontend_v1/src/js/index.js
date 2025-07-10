document.addEventListener('alpine:init', () => {
  Alpine.data('dashboardData', () => ({
    stats: {
      totalMeditators: 0,
      meditatorGrowth: '0%',
      pendingApprovals: 0,
      approvalDecline: '0%',
      totalKuti: 0,
      kutiGrowth: '0%',
      newQuestions: 0,
      questionGrowth: '0%'
    },
    isLoading: true,

    init() {
      this.fetchDashboardData();
    },

    async fetchDashboardData() {
      try {
        // Fetch stats data from API
        const statsResponse = await fetch(`${window.AppConfig.API_BASE_URL}/dashboard/stats/`);
        if (!statsResponse.ok) throw new Error('Failed to load stats');
        const statsData = await statsResponse.json();
        
        // Update stats with actual data or fallback to demo data
        this.stats = {
          totalMeditators: statsData.total_meditators || 124,
          meditatorGrowth: statsData.meditator_growth || '5,2%',
          pendingApprovals: statsData.pending_approvals || 8,
          approvalDecline: statsData.approval_decline || '2,1%',
          totalKuti: statsData.total_kuti || 42,
          kutiGrowth: statsData.kuti_growth || '3,7%',
          newQuestions: statsData.new_questions || 15,
          questionGrowth: statsData.question_growth || '8,5%'
        };

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Fallback to demo data if API fails
        this.stats = {
          totalMeditators: 124,
          meditatorGrowth: '5,2%',
          pendingApprovals: 8,
          approvalDecline: '2,1%',
          totalKuti: 42,
          kutiGrowth: '3,7%',
          newQuestions: 15,
          questionGrowth: '8,5%'
        };
      } finally {
        this.isLoading = false;
      }
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    }
  }));
});
