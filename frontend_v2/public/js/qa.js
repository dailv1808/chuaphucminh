document.addEventListener('alpine:init', function() {
  Alpine.data('qaData', function() {
    return {
      questions: [],
      filteredQuestions: [],
      searchQuery: '',
      statusFilter: '',
      priorityFilter: '',
      sortBy: 'newest',
      showQuestionModal: false,
      showDetailModal: false,
      showConfirmModal: false,
      isEditing: false,
      isLoading: true,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      currentPage: 1,
      perPage: 10,
      selectedQuestion: null,
      statusOptions: [
        { value: 'answered', label: 'Đã trả lời' },
        { value: 'pending', label: 'Chưa trả lời' },
        { value: 'archive', label: 'Lưu trữ' },
        { value: 'reject', label: 'Từ chối' },
        { value: 'review', label: 'Cần xem xét' }
      ],
      priorityOptions: [
        { value: 'high', label: 'Cao' },
        { value: 'medium', label: 'Vừa' },
        { value: 'low', label: 'Thấp' }
      ],
      currentQuestion: {
        id: null,
        name: '',
        email: '',
        content: '',
        short_content: '',
        contact: '',
        answer: '',
        answered_at: null,
        status: 'pending',
        priority: 'medium',
        slideshow: false,
        group: '',
        tags: '',
        created_at: new Date().toISOString()
      },

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
            this.questions = data.map(q => ({
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
        this.sortAndFilterQuestions();
      },

      sortAndFilterQuestions: function() {
        let results = [...this.questions];
        
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          results = results.filter(q => 
            q.name.toLowerCase().includes(query) || 
            q.content.toLowerCase().includes(query) ||
            (q.short_content && q.short_content.toLowerCase().includes(query)) ||
            (q.answer && q.answer.toLowerCase().includes(query))
          );
        }
        
        if (this.statusFilter) {
          results = results.filter(q => q.status === this.statusFilter);
        }
        
        if (this.priorityFilter) {
          results = results.filter(q => q.priority === this.priorityFilter);
        }
        
        if (this.sortBy === 'newest') {
          results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else {
          results.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }
        
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

      openAddQuestionModal: function() {
        this.isEditing = false;
        this.currentQuestion = {
          id: null,
          name: '',
          email: '',
          content: '',
          short_content: '',
          contact: '',
          answer: '',
          answered_at: null,
          status: 'pending',
          priority: 'medium',
          slideshow: false,
          group: '',
          tags: '',
          created_at: new Date().toISOString()
        };
        this.showQuestionModal = true;
      },

      openEditQuestionModal: function(question) {
        this.isEditing = true;
        this.currentQuestion = JSON.parse(JSON.stringify(question));
        this.showQuestionModal = true;
        this.showDetailModal = false;
      },

      closeQuestionModal: function() {
        this.showQuestionModal = false;
      },

      saveQuestion: function() {
        if (!this.currentQuestion.name.trim() || !this.currentQuestion.content.trim()) {
          this.showNotificationMessage('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
          return;
        }

        const payload = this.preparePayload();
        this.isEditing ? this.updateQuestion(payload) : this.createQuestion(payload);
      },

      preparePayload: function() {
        const payload = { 
          ...this.currentQuestion
        };
        
        this.updateAnsweredAt();
        
        // Clean up payload before sending
        delete payload.showAnswerSection;
        delete payload.newAnswer;
        
        return payload;
      },

      createQuestion: function(payload) {
        fetch('http://192.168.0.200:8000/api/questions/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        .then(response => {
          if (!response.ok) throw new Error('Thêm mới thất bại');
          return response.json();
        })
        .then(() => {
          this.showNotificationMessage('Thêm câu hỏi mới thành công', 'success');
          this.showQuestionModal = false;
          this.fetchQuestions();
        })
        .catch(error => {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        });
      },

      updateQuestion: function(payload) {
        const token = localStorage.getItem('access_token');
        fetch(`http://192.168.0.200:8000/api/questions/${this.currentQuestion.id}/`, {
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
          this.showNotificationMessage('Cập nhật câu hỏi thành công', 'success');
          this.showQuestionModal = false;
          this.fetchQuestions();
        })
        .catch(error => {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        });
      },

      confirmDelete: function(question) {
        this.currentQuestion = { ...question };
        this.showConfirmModal = true;
      },

      deleteQuestion: function() {
        const token = localStorage.getItem('access_token');
        fetch(`http://192.168.0.200:8000/api/questions/${this.currentQuestion.id}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}`}
        })
        .then(response => {
          if (!response.ok) throw new Error('Xóa câu hỏi thất bại');
          this.showNotificationMessage('Xóa câu hỏi thành công', 'success');
          this.showConfirmModal = false;
          this.showDetailModal = false;
          this.fetchQuestions();
        })
        .catch(error => {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        });
      },

      updateAnsweredAt: function() {
        if (this.currentQuestion.answer && !this.currentQuestion.answered_at) {
          this.currentQuestion.answered_at = new Date().toISOString();
          this.currentQuestion.status = 'answered';
        } else if (!this.currentQuestion.answer) {
          this.currentQuestion.answered_at = null;
          this.currentQuestion.status = 'pending';
        }
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