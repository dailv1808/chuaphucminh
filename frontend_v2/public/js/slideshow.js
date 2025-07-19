document.addEventListener('alpine:init', function() {
  Alpine.data('slideshowData', function() {
    return {
      questions: [],
      slideshowQuestions: [],
      isLoading: true,
      isSlideshowActive: false,
      currentSlideIndex: 0,
      showNotification: false,
      notificationMessage: '',
      notificationType: 'success',
      
      init: function() {
        this.fetchQuestions();
      },
      
      get currentQuestion() {
        return this.slideshowQuestions[this.currentSlideIndex];
      },
      
      fetchQuestions: function() {
        this.isLoading = true;
        fetch('http://192.168.0.200:8000/api/questions/')
          .then(response => {
            if (!response.ok) throw new Error('Lỗi khi tải danh sách câu hỏi');
            return response.json();
          })
          .then(data => {
            this.questions = data;
            this.slideshowQuestions = data.filter(q => q.slideshow);
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
        const questionIds = this.slideshowQuestions.map(q => q.id);
        
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
          this.slideshowQuestions = this.slideshowQuestions.filter(q => q.id !== question.id);
          this.showNotificationMessage('Đã xóa câu hỏi khỏi trình chiếu', 'success');
        })
        .catch(error => {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        });
      },
      
      startSlideshow: function() {
        if (this.slideshowQuestions.length === 0) {
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
        if (this.currentSlideIndex < this.slideshowQuestions.length - 1) {
          this.currentSlideIndex++;
        } else {
          this.currentSlideIndex = 0; // Loop back to first question
        }
      },
      
      prevSlide: function() {
        if (this.currentSlideIndex > 0) {
          this.currentSlideIndex--;
        } else {
          this.currentSlideIndex = this.slideshowQuestions.length - 1; // Loop to last question
        }
      },
      
      handleKeyDown: function(e) {
        // Prevent default for all keys we handle
        if (['n', 'p', 's'].includes(e.key.toLowerCase())) {
          e.preventDefault();
        }

        switch (e.key.toLowerCase()) {
          case 'n':
            this.nextSlide();
            break;
          case 'p':
            this.prevSlide();
            break;
          case 's':
            this.stopSlideshow();
            break;
          case 'arrowright':
            this.nextSlide();
            break;
          case 'arrowleft':
            this.prevSlide();
            break;
          case 'escape':
            this.stopSlideshow();
            break;
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