document.addEventListener('alpine:init', function() {
  Alpine.data('qaData', function() {
    return {
      questions: [],
      filteredQuestions: [],
      slideshowFilter: '',
      faqFilter: '',
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
      currentQuestionIndex: 0,
      statusOptions: [
        { value: 'answered', label: 'Đã trả lời' },
        { value: 'pending', label: 'Chưa trả lời' },
        { value: 'archive', label: 'Lưu trữ' },
        { value: 'reject', label: 'Từ chối' },
        { value: 'review', label: 'Xem xét' }
      ],
      priorityOptions: [
        { value: 'high', label: 'Cao' },
        { value: 'medium', label: 'Vừa' },
        { value: 'low', label: 'Thấp' }
      ],
      currentQuestion: {
        id: null,
        name: '',
        content: '',
        edited_content: '',
        short_content: '',
        contact: '',
        answer: '',
        answered_at: null,
        status: 'pending',
        priority: 'medium',
        slideshow: false,
        is_faq: false,
        group: '',
        tags: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null
      },


      
      quickEditField: async function(question, field, value) {
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Đặc biệt xử lý cho trường content
        const payload = {
          [field === 'content' ? 'edited_content' : field]: value,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        };

        try {
          // Tạo bản sao của giá trị cũ để rollback nếu cần
          const oldValue = field === 'content' 
            ? question.edited_content || question.short_content || question.content
            : question[field];

          // Cập nhật giá trị ngay lập tức trên giao diện
          if (field === 'content') {
            question.edited_content = value;
          } else {
            question[field] = value;
          }

          const response = await fetch(`http://192.168.0.200:8000/api/questions/${question.id}/`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            // Rollback giá trị nếu có lỗi
            if (field === 'content') {
              question.edited_content = oldValue;
            } else {
              question[field] = oldValue;
            }
            throw new Error('Cập nhật thất bại');
          }
          
          // Cập nhật lại dữ liệu từ server
          const updatedQuestion = await response.json();
          
          // Giữ lại trạng thái hiện tại của các trường không liên quan
          const currentShowAnswerSection = question.showAnswerSection;
          const currentNewAnswer = question.newAnswer;
          
          // Cập nhật toàn bộ dữ liệu từ server
          Object.assign(question, updatedQuestion);
          
          // Khôi phục trạng thái các trường không liên quan
          question.showAnswerSection = currentShowAnswerSection;
          question.newAnswer = currentNewAnswer;
          
          this.showNotificationMessage('Cập nhật thành công', 'success');
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        }
      },




     

      init: function() {
        if (!localStorage.getItem('access_token')) {
          window.location.href = '/login.html?next=' + encodeURIComponent(window.location.pathname);
        }
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

      getStatusLabel: function(status) {
        const option = this.statusOptions.find(s => s.value === status);
        return option ? option.label : status;
      },

      fetchQuestions: function() {
        this.isLoading = true;
        const token = localStorage.getItem('access_token');
        fetch('http://192.168.0.200:8000/api/questions/', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(response => {
            if (!response.ok) throw new Error('Lỗi khi tải danh sách câu hỏi');
            return response.json();
          })
          .then(data => {
            this.questions = data.map(q => ({
              ...q,
              showAnswerSection: false,
              newAnswer: '',
              created_by: q.created_by || {username: 'Khách', full_name: 'Khách'},
              updated_by: q.updated_by || q.created_by || {username: 'Khách', full_name: 'Khách'}
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
        this.currentQuestionIndex = this.filteredQuestions.findIndex(q => q.id === question.id);
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
            (q.answer && q.answer.toLowerCase().includes(query)) ||
            (q.group && q.group.toLowerCase().includes(query)) ||
            (q.tags && q.tags.toLowerCase().includes(query))
          );
        }
        
        if (this.statusFilter) {
          results = results.filter(q => q.status === this.statusFilter);
        }
        
        if (this.priorityFilter) {
          results = results.filter(q => q.priority === this.priorityFilter);
        }
        
        if (this.slideshowFilter === 'yes') {
          results = results.filter(q => q.slideshow);
        } else if (this.slideshowFilter === 'no') {
          results = results.filter(q => !q.slideshow);
        }
        
        if (this.faqFilter === 'yes') {
          results = results.filter(q => q.is_faq);
        } else if (this.faqFilter === 'no') {
          results = results.filter(q => !q.is_faq);
        }
        
        if (this.sortBy === 'newest') {
          results.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        } else if (this.sortBy === 'oldest') {
          results.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
        } else if (this.sortBy === 'newest_created') {
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
        const user = JSON.parse(localStorage.getItem('user'));
        
        this.currentQuestion = {
          id: null,
          name: '',
          content: '',
          edited_content: '',
          short_content: '',
          contact: '',
          answer: '',
          answered_at: null,
          status: 'pending',
          priority: 'medium',
          slideshow: false,
          is_faq: false,
          group: '',
          tags: '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: user ? { 
            id: user.id, 
            username: user.username,
            full_name: user.full_name
          } : null,
          updated_by: null
        };
        this.showQuestionModal = true;
      },

      openEditQuestionModal: function(question) {
        this.isEditing = true;
        this.currentQuestion = JSON.parse(JSON.stringify(question));
        this.currentQuestionIndex = this.filteredQuestions.findIndex(q => q.id === question.id);
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
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        const payload = { 
          ...this.currentQuestion,
          updated_by: user?.id || null
        };
        
        if (!this.isEditing) {
          payload.created_by = user?.id || null;
        }
        
        this.updateAnsweredAt();
        
        // Clean up payload before sending
        delete payload.showAnswerSection;
        delete payload.newAnswer;
        delete payload.created_by_obj;
        delete payload.updated_by_obj;
        
        return payload;
      },

      createQuestion: function(payload) {
        const token = localStorage.getItem('access_token');
        fetch('http://192.168.0.200:8000/api/questions/', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
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
          headers: { 'Authorization': `Bearer ${token}` }
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

      formatDate: function(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
      },

      navigateQuestion: function(direction) {
        const newIndex = this.currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < this.filteredQuestions.length) {
          const question = this.filteredQuestions[newIndex];
          if (this.showDetailModal) {
            this.showQuestionDetail(question);
          } else if (this.showQuestionModal) {
            this.openEditQuestionModal(question);
          }
        }
      },

      handleKeyNavigation: function(event) {
        if (this.showDetailModal || this.showQuestionModal) {
          if (event.key === 'ArrowLeft') {
            this.navigateQuestion(-1);
            event.preventDefault();
          } else if (event.key === 'ArrowRight') {
            this.navigateQuestion(1);
            event.preventDefault();
          }
        }
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