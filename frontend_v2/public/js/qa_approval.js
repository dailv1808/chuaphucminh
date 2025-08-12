document.addEventListener('alpine:init', function() {
  Alpine.data('qaApprovalData', function() {
    return {
      questions: [],
      filteredQuestions: [],
      searchQuery: '',
      showDetailModal: false,
      isLoading: true,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      currentPage: 1,
      perPage: 10,
      selectedQuestion: null,
      priorityOptions: [
        { value: 'high', label: 'Cao' },
        { value: 'medium', label: 'Vừa' },
        { value: 'low', label: 'Thấp' }
      ],

      init: function() {
        this.fetchQuestions();
      },

      get paginatedQuestions() {
        const start = (this.currentPage - 1) * this.perPage;
        const end = start + this.perPage;
        return this.filteredQuestions.slice(start, end);
      },

      get totalPages() {
        return Math.ceil(this.filteredQuestions.length / this.perPage);
      },

      fetchQuestions: function() {
        this.isLoading = true;
        fetch('http://192.168.0.200:8000/api/questions/')
          .then(response => {
            if (!response.ok) throw new Error('Lỗi khi tải danh sách câu hỏi');
            return response.json();
          })
          .then(data => {
            // Lọc chỉ các câu hỏi có trạng thái "review"
            this.questions = data.filter(q => q.status === 'review').map(q => ({
              ...q,
              showAnswerSection: false,
              newAnswer: ''
            }));
            this.applyFilters();
          })
          .catch(error => {
            console.error('Error:', error);
            this.showNotificationMessage(error.message, 'error');
          })
          .finally(() => {
            this.isLoading = false;
          });
      },

      showQuestionDetail: function(question) {
        this.selectedQuestion = JSON.parse(JSON.stringify(question));
        this.showDetailModal = true;
      },

      applyFilters: function() {
        this.currentPage = 1;
        let results = [...this.questions];
        
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          results = results.filter(q => 
            q.name.toLowerCase().includes(query) || 
            q.content.toLowerCase().includes(query) ||
            (q.short_content && q.short_content.toLowerCase().includes(query)) ||
            (q.group && q.group.toLowerCase().includes(query)) ||
            (q.tags && q.tags.toLowerCase().includes(query))
          );
        }
        
        // Sắp xếp theo ngày tạo mới nhất
        results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        this.filteredQuestions = results;
      },

      goToPage: function(page) {
        this.currentPage = page;
      },

      prevPage: function() {
        if (this.currentPage > 1) this.currentPage--;
      },

      nextPage: function() {
        if (this.currentPage < this.totalPages) this.currentPage++;
      },

      approveQuestion: function(question) {
        this.updateQuestionStatus(question, 'pending', 'Phê duyệt thành công');
      },

      rejectQuestion: function(question) {
        this.updateQuestionStatus(question, 'reject', 'Từ chối thành công');
      },

      updateQuestionStatus: function(question, newStatus, successMessage) {
        const token = localStorage.getItem('access_token');
        const payload = {
          ...question,
          status: newStatus
        };
        
        fetch(`http://192.168.0.200:8000/api/questions/${question.id}/`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`, 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify(payload)
        })
        .then(response => {
          if (!response.ok) throw new Error('Cập nhật thất bại');
          return response.json();
        })
        .then(() => {
          this.showNotificationMessage(successMessage, 'success');
          this.showDetailModal = false;
          this.fetchQuestions();
        })
        .catch(error => {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        });
      },

      formatDateTime: function(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },

      showNotificationMessage: function(message, type) {
        this.notificationMessage = message;
        this.notificationType = type;
        this.showNotification = true;
        setTimeout(() => this.showNotification = false, 3000);
      }
    };
  });
});