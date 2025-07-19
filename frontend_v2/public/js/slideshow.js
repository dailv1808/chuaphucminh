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
      keyboardHandler: null,
      youtubeLink: '',
      youtubePlayer: null,
      isYouTubeAPILoaded: false,
      
      init: function() {
        this.fetchQuestions();
        this.loadYouTubeAPI();
      },
      
      loadYouTubeAPI: function() {
        // Kiểm tra nếu API đã được load
        if (window.YT) {
          this.isYouTubeAPILoaded = true;
          return;
        }
        
        // Tạo thẻ script để load YouTube API
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        // Callback khi API sẵn sàng
        window.onYouTubeIframeAPIReady = () => {
          this.isYouTubeAPILoaded = true;
        };
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
      
      startSlideshow: function() {
        if (this.slideshowQuestions.length === 0) {
          this.showNotificationMessage('Không có câu hỏi nào để trình chiếu', 'error');
          return;
        }
        
        if (!this.youtubeLink) {
          this.showNotificationMessage('Vui lòng nhập link YouTube livestream', 'error');
          return;
        }
        
        this.currentSlideIndex = 0;
        this.isSlideshowActive = true;
        
        // Khởi tạo YouTube Player
        this.initializeYouTubePlayer();
        
        // Xử lý sự kiện bàn phím
        this.keyboardHandler = (e) => {
          const key = e.key.toLowerCase();
          
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
            case 'r':
              e.preventDefault();
              this.saveCurrentTimestamp();
              break;
          }
        };
        
        document.addEventListener('keydown', this.keyboardHandler);
      },
      
      initializeYouTubePlayer: function() {
        if (!this.isYouTubeAPILoaded) {
          this.showNotificationMessage('YouTube API chưa sẵn sàng', 'error');
          return;
        }
        
        const videoId = this.extractYouTubeId(this.youtubeLink);
        if (!videoId) {
          this.showNotificationMessage('Link YouTube không hợp lệ', 'error');
          return;
        }
        
        // Tạo player ẩn
        const playerContainer = document.createElement('div');
        playerContainer.id = 'youtube-player';
        playerContainer.style.display = 'none';
        document.body.appendChild(playerContainer);
        
        this.youtubePlayer = new YT.Player('youtube-player', {
          videoId: videoId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0
          }
        });
      },
      
      stopSlideshow: function() {
        this.isSlideshowActive = false;
        
        // Xóa sự kiện bàn phím
        if (this.keyboardHandler) {
          document.removeEventListener('keydown', this.keyboardHandler);
          this.keyboardHandler = null;
        }
        
        // Hủy YouTube Player
        if (this.youtubePlayer) {
          this.youtubePlayer.destroy();
          const playerContainer = document.getElementById('youtube-player');
          if (playerContainer) {
            playerContainer.remove();
          }
          this.youtubePlayer = null;
        }
      },
      
      saveCurrentTimestamp: async function() {
        if (!this.youtubePlayer) {
          this.showNotificationMessage('YouTube Player chưa sẵn sàng', 'error');
          return;
        }
        
        try {
          const currentTime = await this.getCurrentTime();
          const timestampLink = `${this.youtubeLink}&t=${Math.floor(currentTime)}s`;
          
          await this.updateQuestionAnswer(this.currentQuestion.id, timestampLink);
          
          this.showNotificationMessage(`Đã lưu thời điểm ${Math.floor(currentTime)}s vào câu trả lời`, 'success');
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage('Lỗi khi lấy thời gian video: ' + error.message, 'error');
        }
      },
      
      getCurrentTime: function() {
        return new Promise((resolve, reject) => {
          try {
            const time = this.youtubePlayer.getCurrentTime();
            if (typeof time === 'number') {
              resolve(time);
            } else {
              reject(new Error('Không thể lấy thời gian hiện tại'));
            }
          } catch (error) {
            reject(error);
          }
        });
      },
      
      extractYouTubeId: function(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
      },
      
      updateQuestionAnswer: async function(questionId, answer) {
        const token = localStorage.getItem('access_token');
        
        const response = await fetch(`http://192.168.0.200:8000/api/questions/${questionId}/`, {
          method: 'PATCH',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            answer: answer,
            status: 'answered',
            answered_at: new Date().toISOString()
          })
        });

        if (!response.ok) {
          throw new Error('Cập nhật câu trả lời thất bại');
        }

        // Cập nhật local data
        const updatedQuestion = await response.json();
        this.slideshowQuestions = this.slideshowQuestions.map(q => 
          q.id === questionId ? updatedQuestion : q
        );
      },
      
      nextSlide: function() {
        if (this.currentSlideIndex < this.slideshowQuestions.length - 1) {
          this.currentSlideIndex++;
        } else {
          this.currentSlideIndex = 0;
        }
      },
      
      prevSlide: function() {
        if (this.currentSlideIndex > 0) {
          this.currentSlideIndex--;
        } else {
          this.currentSlideIndex = this.slideshowQuestions.length - 1;
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