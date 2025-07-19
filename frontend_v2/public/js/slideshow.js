document.addEventListener('alpine:init', function() {
  Alpine.data('slideshowData', function() {
    return {
      questions: [],
      isLoading: true,
      isSlideshowActive: false,
      currentSlideIndex: 0,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      
      init: function() {
        this.fetchSlideshowQuestions();
      },
      
      get currentQuestion() {
        return this.questions[this.currentSlideIndex];
      },
      
      fetchSlideshowQuestions: function() {
        this.isLoading = true;
        fetch('http://192.168.0.200:8000/api/questions/?slideshow=true')
          .then(response => {
            if (!response.ok) throw new Error('Lỗi khi tải danh sách câu hỏi trình chiếu');
            return response.json();
          })
          .then(data => {
            this.questions = data;
          })
          .catch(error => {
            console.error('Error:', error);
            this.showNotificationMessage(error.message, 'error');
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      
      updateQuestionOrder: function() {
        const token = localStorage.getItem('access_token');
        const questionIds = this.questions.map(q => q.id);
        
        fetch('http://192.168.0.200:8000/api/questions/update_order/', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ question_ids: questionIds })
        })
        .then(response => {
          if (!response.ok) throw new Error('Cập nhật thứ tự thất bại');
          return response.json();
        })
        .then(() => {
          this.showNotificationMessage('Cập nhật thứ tự thành công', 'success');
        })
        .catch(error => {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        });
      },
      
      removeFromSlideshow: function(question) {
        const token = localStorage.getItem('access_token');
        
        fetch(`http://192.168.0.200:8000/api/questions/${question.id}/`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ slideshow: false })
        })
        .then(response => {
          if (!response.ok) throw new Error('Xóa khỏi trình chiếu thất bại');
          return response.json();
        })
        .then(() => {
          this.questions = this.questions.filter(q => q.id !== question.id);
          this.showNotificationMessage('Đã xóa câu hỏi khỏi trình chiếu', 'success');
        })
        .catch(error => {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        });
      },
      
      startSlideshow: function() {
        if (this.questions.length === 0) {
          this.showNotificationMessage('Không có câu hỏi nào để trình chiếu', 'error');
          return;
        }
        
        this.currentSlideIndex = 0;
        this.isSlideshowActive = true;
        
        // Prevent exiting with ESC key
        document.addEventListener('keydown', this.handleKeyDown);
      },
      
      stopSlideshow: function() {
        this.isSlideshowActive = false;
        document.removeEventListener('keydown', this.handleKeyDown);
      },
      
      nextSlide: function() {
        if (this.currentSlideIndex < this.questions.length - 1) {
          this.currentSlideIndex++;
        } else {
          this.currentSlideIndex = 0; // Loop back to first question
        }
      },
      
      prevSlide: function() {
        if (this.currentSlideIndex > 0) {
          this.currentSlideIndex--;
        } else {
          this.currentSlideIndex = this.questions.length - 1; // Loop to last question
        }
      },
      
      handleKeyDown: function(e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          this.stopSlideshow();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          this.nextSlide();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          this.prevSlide();
        }
      }.bind(this),
      
      showNotificationMessage: function(message, type) {
        this.notificationMessage = message;
        this.notificationType = type;
        this.showNotification = true;
        setTimeout(() => this.showNotification = false, 3000);
      }
    };
  });
});