document.addEventListener('alpine:init', () => {
  Alpine.data('qaData', () => ({
    questions: [],
    filteredQuestions: [],
    searchQuery: '',
    showQuestionModal: false,
    showConfirmModal: false,
    isEditing: false,
    isLoading: true,
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',
    currentQuestion: {
      id: null,
      name: '',
      email: '',
      content: '',
      status: 'pending',
      priority: 'medium',
      group: null,
      tags: []
    },

    init() {
      this.fetchQuestions();
    },

    async fetchQuestions() {
      try {
        this.isLoading = true;
        const response = await fetch('http://192.168.0.200:8000/api/questions/');
        
        if (!response.ok) throw new Error('Lỗi khi tải danh sách câu hỏi');
        
        const data = await response.json();
        // Sắp xếp theo thời gian tạo mới nhất trước
        this.questions = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        this.filteredQuestions = [...this.questions];
      } catch (error) {
        console.error('Error:', error);
        this.showNotificationMessage(error.message, 'error');
      } finally {
        this.isLoading = false;
      }
    },

    filterQuestions() {
      if (!this.searchQuery) {
        this.filteredQuestions = [...this.questions];
        return;
      }
      
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredQuestions = this.questions.filter(question => {
        return (
          question.name.toLowerCase().includes(query) ||
          question.email.toLowerCase().includes(query) ||
          question.content.toLowerCase().includes(query) ||
          question.status.toLowerCase().includes(query) ||
          question.priority.toLowerCase().includes(query)
        );
      });
    },

    openAddQuestionModal() {
      this.isEditing = false;
      this.currentQuestion = {
        id: null,
        name: '',
        email: '',
        content: '',
        status: 'pending',
        priority: 'medium',
        group: null,
        tags: []
      };
      this.showQuestionModal = true;
    },

    openEditQuestionModal(question) {
      this.isEditing = true;
      this.currentQuestion = { ...question };
      this.showQuestionModal = true;
    },

    closeQuestionModal() {
      this.showQuestionModal = false;
    },

    validateQuestionForm() {
      if (!this.currentQuestion.name.trim()) {
        this.showNotificationMessage('Vui lòng nhập tên người hỏi', 'error');
        return false;
      }
      if (!this.currentQuestion.email.trim()) {
        this.showNotificationMessage('Vui lòng nhập email', 'error');
        return false;
      }
      if (!this.currentQuestion.content.trim()) {
        this.showNotificationMessage('Vui lòng nhập nội dung câu hỏi', 'error');
        return false;
      }
      return true;
    },

    async saveQuestion() {
      if (!this.validateQuestionForm()) return;

      try {
        const url = this.isEditing 
          ? `http://192.168.0.200:8000/api/questions/${this.currentQuestion.id}/`
          : 'http://192.168.0.200:8000/api/questions/';
        
        const method = this.isEditing ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method: method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.currentQuestion)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || (this.isEditing ? 'Cập nhật thất bại' : 'Thêm mới thất bại'));
        }
        
        this.showNotificationMessage(
          this.isEditing ? 'Cập nhật câu hỏi thành công' : 'Thêm câu hỏi mới thành công', 
          'success'
        );
        
        this.showQuestionModal = false;
        await this.fetchQuestions();
      } catch (error) {
        console.error('Error:', error);
        this.showNotificationMessage(error.message, 'error');
      }
    },

    confirmDelete(question) {
      this.currentQuestion = { ...question };
      this.showConfirmModal = true;
    },

    async deleteQuestion() {
      try {
        const response = await fetch(`http://192.168.0.200:8000/api/questions/${this.currentQuestion.id}/`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Xóa câu hỏi thất bại');
        }
        
        this.showNotificationMessage('Xóa câu hỏi thành công', 'success');
        this.showConfirmModal = false;
        await this.fetchQuestions();
      } catch (error) {
        console.error('Error:', error);
        this.showNotificationMessage(error.message, 'error');
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
