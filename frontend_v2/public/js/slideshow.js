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

      // Hàm lấy nội dung câu hỏi - ưu tiên edited_content, nếu trống thì lấy content
      getQuestionContent: function(question) {
        return question.edited_content && question.edited_content.trim() !== '' 
          ? question.edited_content 
          : question.content;
      },

      downloadPowerPoint: async function() {
        if (this.slideshowQuestions.length === 0) {
          this.showNotificationMessage('Không có câu hỏi nào để tạo PowerPoint', 'error');
          return;
        }

        try {
          this.showNotificationMessage('Đang tạo PowerPoint...', 'success');
          
          // Tạo nội dung PowerPoint
          const pptx = new PptxGenJS();
          
          // Slide chào mừng
          const welcomeSlide = pptx.addSlide();
          welcomeSlide.background = { fill: '6a0000' };
          welcomeSlide.addText('HỎI PHÁP\nTRÌNH PHÁP', {
            x: 0.5,
            y: 2,
            w: '90%',
            h: 3,
            fontSize: 48,
            bold: true,
            color: 'FFFFFF',
            align: 'left',
            fontFace: 'Arial',
            valign: 'middle',
            isTextBox: true,
            lineSpacing: 1.2
          });

          // Các slide câu hỏi
          this.slideshowQuestions.forEach((question, index) => {
            const slide = pptx.addSlide();
            
            // Tiêu đề slide
            slide.addText(`Câu hỏi ${index + 1}`, {
              x: 0.5,
              y: 0.5,
              w: '90%',
              fontSize: 28,
              bold: true,
              color: '2E86AB'
            });

            // Thông tin người hỏi
            slide.addText(`Hành giả: ${question.name || 'Ẩn danh'}`, {
              x: 0.5,
              y: 1.2,
              w: '90%',
              fontSize: 20,
              bold: true,
              color: '000000'
            });

            // Nội dung câu hỏi - sử dụng hàm getQuestionContent để lấy nội dung
            const content = this.getQuestionContent(question);
            slide.addText(content, {
              x: 0.5,
              y: 2.0,
              w: '90%',
              h: 4,
              fontSize: 16,
              color: '333333',
              align: 'left',
              valign: 'top',
              isTextBox: true,
              lineSpacing: 1.3,
              preserveFormatting: true // Giữ nguyên định dạng xuống dòng
            });

            // Footer với số trang
            slide.addText(`Trang ${index + 2}`, {
              x: 0.5,
              y: 6.5,
              w: '90%',
              fontSize: 12,
              color: '666666',
              align: 'center'
            });
          });

          // Tải file xuống
          const fileName = `Hoi-Dap-Phap-Am-${new Date().toISOString().split('T')[0]}.pptx`;
          await pptx.writeFile({ fileName: fileName });
          
          this.showNotificationMessage('Đã tạo PowerPoint thành công!', 'success');
          
        } catch (error) {
          console.error('Error creating PowerPoint:', error);
          this.showNotificationMessage('Lỗi khi tạo PowerPoint: ' + error.message, 'error');
        }
      },

      loadYouTubeAPI: function() {
        if (window.YT) {
          this.isYouTubeAPILoaded = true;
          return;
        }
        
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        
        window.onYouTubeIframeAPIReady = () => {
          this.isYouTubeAPILoaded = true;
          console.log('YouTube API ready');
        };
      },
      
      get currentQuestion() {
        return this.slideshowQuestions[this.currentSlideIndex - 1];
      },
      
      fetchQuestions: function() {
        this.isLoading = true;
        fetch('https://api.chuaphucminh.xyz/api/questions/')
          .then(response => {
            if (!response.ok) throw new Error('Lỗi khi tải danh sách câu hỏi');
            return response.json();
          })
          .then(data => {
            this.questions = data.map(q => ({
              ...q,
              // Đảm bảo có edited_content nếu không có thì dùng content
              displayContent: q.edited_content || q.content
            }));
            
            // Lọc câu hỏi trình chiếu và sắp xếp theo thứ tự cũ nhất trước
            this.slideshowQuestions = data
              .filter(q => q.status === "pending" && q.slideshow === true)
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at)); // Sắp xếp cũ nhất trước
          })
          .catch(error => {
            console.error('Error:', error);
            this.showNotificationMessage(error.message, 'error');
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      
      markAsAnswered: async function(question) {
        if (!this.youtubeLink) {
          this.showNotificationMessage('Vui lòng nhập link YouTube livestream', 'error');
          return;
        }

        try {
          // Đảm bảo YouTube player đã sẵn sàng
          if (!this.youtubePlayer) {
            await this.initializeYouTubePlayer();
          }

          // Lấy thời gian hiện tại từ video
          const currentTime = await this.getCurrentTime();
          const videoId = this.extractYouTubeId(this.youtubeLink);
          
          if (!videoId) {
            this.showNotificationMessage('Link YouTube không hợp lệ', 'error');
            return;
          }

          const cleanUrl = this.youtubeLink.split('&')[0];
          const timestampLink = `${cleanUrl}&t=${Math.floor(currentTime)}s`;
          
          await this.updateQuestionAnswer(
            question.id, 
            `Tham khảo video tại: ${timestampLink}`
          );
          
          this.showNotificationMessage(
            `Đã đánh dấu câu hỏi là đã trả lời tại ${this.formatTime(currentTime)}`,
            'success'
          );
          
          this.fetchQuestions();
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage('Lỗi khi đánh dấu câu hỏi: ' + error.message, 'error');
        }
      },
      
      removeFromSlideshow: async function(question) {
        try {
          const token = localStorage.getItem('access_token');
          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${question.id}/`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              slideshow: false
            })
          });

          if (!response.ok) {
            throw new Error('Cập nhật câu hỏi thất bại');
          }

          this.showNotificationMessage('Đã xóa câu hỏi khỏi trình chiếu', 'success');
          this.fetchQuestions();
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage('Lỗi khi xóa câu hỏi: ' + error.message, 'error');
        }
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
        this.initializeYouTubePlayer();
        
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

        if (this.youtubePlayer) {
          this.youtubePlayer.destroy();
        }

        this.youtubePlayer = new YT.Player('youtube-player', {
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            disablekb: 1,
            enablejsapi: 1,
            fs: 0,
            modestbranding: 1,
            rel: 0
          },
          events: {
            'onReady': (event) => {
              event.target.playVideo();
              console.log('YouTube Player ready');
            },
            'onStateChange': (event) => {
              console.log('Player state:', event.data);
            },
            'onError': (error) => {
              console.error('Player error:', error);
            }
          }
        });
      },
      
      stopSlideshow: function() {
        this.isSlideshowActive = false;
        
        if (this.keyboardHandler) {
          document.removeEventListener('keydown', this.keyboardHandler);
          this.keyboardHandler = null;
        }
        
        if (this.youtubePlayer) {
          this.youtubePlayer.destroy();
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
          const cleanUrl = this.youtubeLink.split('&')[0];
          const timestampLink = `${cleanUrl}&t=${Math.floor(currentTime)}s`;
          
          await this.updateQuestionAnswer(
            this.currentQuestion.id, 
            `Tham khảo video tại: ${timestampLink}`
          );
          
          this.showNotificationMessage(
            `Đã lưu thời điểm ${this.formatTime(currentTime)} vào câu trả lời`, 
            'success'
          );
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage('Lỗi khi lấy thời gian video: ' + error.message, 'error');
        }
      },

      getCurrentTime: function() {
        return new Promise((resolve, reject) => {
          if (!this.youtubePlayer) {
            reject(new Error('YouTube Player chưa khởi tạo'));
            return;
          }

          // Thử lấy thời gian nhiều lần nếu cần
          const tryGetTime = (attempts = 0) => {
            try {
              const time = this.youtubePlayer.getCurrentTime();
              
              if (time > 0 || attempts >= 3) {
                resolve(time);
              } else {
                setTimeout(() => tryGetTime(attempts + 1), 500);
              }
            } catch (error) {
              if (attempts >= 3) {
                reject(error);
              } else {
                setTimeout(() => tryGetTime(attempts + 1), 500);
              }
            }
          };

          tryGetTime();
        });
      },
      
      extractYouTubeId: function(url) {
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|v=)([^#&?]*).*/;
        const match = url.match(regExp);
        
        if (match && match[2].length === 11) {
          return match[2];
        }
        
        const shortRegExp = /youtu\.be\/([^#&?]*)/;
        const shortMatch = url.match(shortRegExp);
        
        return shortMatch ? shortMatch[1] : null;
      },
      
      updateQuestionAnswer: async function(questionId, answer) {
        const token = localStorage.getItem('access_token');
        
        try {
          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${questionId}/`, {
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

          const updatedQuestion = await response.json();
          this.slideshowQuestions = this.slideshowQuestions.map(q => 
            q.id === questionId ? updatedQuestion : q
          );
        } catch (error) {
          console.error('Update error:', error);
          throw error;
        }
      },
      
      formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      },
      
      nextSlide: function() {
        if (this.currentSlideIndex < this.slideshowQuestions.length) {
          this.currentSlideIndex++;
        } else {
          this.currentSlideIndex = 0;
        }
      },
      
      prevSlide: function() {
        if (this.currentSlideIndex > 0) {
          this.currentSlideIndex--;
        } else {
          this.currentSlideIndex = this.slideshowQuestions.length;
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