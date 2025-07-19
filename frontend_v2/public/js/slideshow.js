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
      keyboardHandler: null, // Thêm biến lưu trữ hàm xử lý sự kiện bàn phím
      
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
            this.slideshowQuestions = data.filter(q => 
              q.status === "pending" && q.slideshow === true
            );
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
        
        // Tạo và gán hàm xử lý sự kiện bàn phím
        this.keyboardHandler = (e) => {
          const key = e.key.toLowerCase();
          
          // Chỉ xử lý khi trình chiếu đang active
          if (!this.isSlideshowActive) return;
          
          switch (key) {
            case 'n':
            case 'arrowright':
              e.preventDefault();
              this.nextSlide();
              break;
            case 'p':
            case 'arrowleft':
              e.preventDefault();
              this.prevSlide();
              break;
            case 's':
            case 'escape':
              e.preventDefault();
              this.stopSlideshow();
              break;
          }
        };
        
        // Thêm sự kiện bàn phím
        document.addEventListener('keydown', this.keyboardHandler);
      },
      
      stopSlideshow: function() {
        this.isSlideshowActive = false;
        // Xóa sự kiện bàn phím
        if (this.keyboardHandler) {
          document.removeEventListener('keydown', this.keyboardHandler);
          this.keyboardHandler = null;
        }
      },
      
      nextSlide: function() {
        if (this.currentSlideIndex < this.slideshowQuestions.length - 1) {
          this.currentSlideIndex++;
        } else {
          this.currentSlideIndex = 0; // Về câu đầu tiên
        }
      },
      
      prevSlide: function() {
        if (this.currentSlideIndex > 0) {
          this.currentSlideIndex--;
        } else {
          this.currentSlideIndex = this.slideshowQuestions.length - 1; // Đến câu cuối cùng
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