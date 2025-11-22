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
      jumpToSlide: 1,
      answeredQuestions: new Set(), // Theo dõi câu hỏi đã được đánh dấu
      
      init: function() {
        this.fetchQuestions();
        this.loadYouTubeAPI();
        this.loadCachedYouTubeLink();
      },










      downloadPDF: async function() {
        if (this.slideshowQuestions.length === 0) {
          this.showNotificationMessage('Không có câu hỏi nào để tạo PDF', 'error');
          return;
        }

        try {
          this.showNotificationMessage('Đang tạo PDF với font tiếng Việt...', 'success');
          
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
          });

          // Sử dụng font mặc định (cố gắng hỗ trợ tiếng Việt)
          // jsPDF 2.x sử dụng API khác
          doc.setFont("helvetica", "normal");

          // Slide chào mừng
          doc.setFillColor(106, 0, 0);
          doc.rect(0, 0, 297, 210, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(44);
          doc.setFont("helvetica", "bold");
          
          doc.text('HỎI PHÁP', 20, 80);
          doc.text('TRÌNH PHÁP', 20, 120);

          // Các slide câu hỏi
          for (let i = 0; i < this.slideshowQuestions.length; i++) {
            doc.addPage();
            
            const question = this.slideshowQuestions[i];
            
            // Tiêu đề slide
            doc.setTextColor(46, 134, 171);
            doc.setFontSize(20);
            doc.setFont("helvetica", "bold");
            doc.text(`Câu hỏi ${i + 1}`, 15, 20);
            
            // Thông tin người hỏi
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.text(`Hành giả: ${question.name || 'Ẩn danh'}`, 15, 35);
            
            // Nội dung câu hỏi
            const content = this.getQuestionContent(question);
            doc.setFontSize(14);
            doc.setTextColor(51, 51, 51);
            
            // Xử lý nội dung tiếng Việt
            const lines = doc.splitTextToSize(content, 270);
            
            let textY = 50;
            const lineHeight = 7;
            
            for (let line of lines) {
              if (textY < 180) {
                doc.text(line, 20, textY);
                textY += lineHeight;
              }
            }
            
            // Footer
            doc.setTextColor(102, 102, 102);
            doc.setFontSize(10);
            doc.text(`Trang ${i + 2}`, 148, 200, { align: 'center' });
          }

          const fileName = `Slide-Hoi-Dap-${new Date().toISOString().split('T')[0]}.pdf`;
          doc.save(fileName);
          
          this.showNotificationMessage('Đã tạo PDF thành công!', 'success');
          
        } catch (error) {
          console.error('Error creating PDF:', error);
          this.showNotificationMessage('Lỗi khi tạo PDF: ' + error.message, 'error');
        }
      },




      



      
  


      
      








      // Hàm lấy nội dung câu hỏi - ưu tiên edited_content, nếu trống thì lấy content
   
      // THÊM METHOD MỚI - Cache YouTube link
      loadCachedYouTubeLink: function() {
        const cachedLink = localStorage.getItem('cached_youtube_link');
        if (cachedLink) {
          this.youtubeLink = cachedLink;
        }
      },

      // THÊM METHOD MỚI - Save YouTube link to cache
      saveYouTubeLinkToCache: function() {
        if (this.youtubeLink && this.youtubeLink.trim() !== '') {
          localStorage.setItem('cached_youtube_link', this.youtubeLink);
        }
      },

      getQuestionContent: function(question) {
        const content = question.edited_content && question.edited_content.trim() !== '' 
          ? question.edited_content 
          : question.content;
        
        // Xử lý nội dung để đảm bảo định dạng đúng
        if (!content) return '';
        
        // Thay thế nhiều khoảng trắng liên tiếp bằng một khoảng trắng
        let processedContent = content.replace(/\s+/g, ' ');
        
        // Đảm bảo xuống dòng đúng cách
        processedContent = processedContent.replace(/\n/g, '\n');
        
        // Thêm khoảng trống giữa các đoạn nếu cần
        processedContent = processedContent.replace(/\n/g, '\n\n');
        
        // Giới hạn độ dài mỗi dòng (tùy chọn)
        processedContent = this.wrapText(processedContent, 80);
        
        return processedContent;
      },



      jumpToSlideNumber: function() {
        const slideNumber = parseInt(this.jumpToSlide);
        if (slideNumber >= 1 && slideNumber <= this.slideshowQuestions.length) {
          this.currentSlideIndex = slideNumber;
        } else {
          this.showNotificationMessage('Số slide không hợp lệ', 'error');
        }
        this.jumpToSlide = ''; // Reset input
      },

      // Hàm hỗ trợ wrap text
      wrapText: function(text, maxLength) {
        const words = text.split(' ');
        let lines = [];
        let currentLine = '';

        words.forEach(word => {
          if ((currentLine + word).length <= maxLength) {
            currentLine += (currentLine === '' ? '' : ' ') + word;
          } else {
            if (currentLine !== '') {
              lines.push(currentLine);
            }
            currentLine = word;
          }
        });

        if (currentLine !== '') {
          lines.push(currentLine);
        }

        return lines.join('\n');
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
            y: 2.5,
            w: '90%',
            h: 2,
            fontSize: 44,
            bold: true,
            color: 'FFFFFF',
            align: 'left',
            fontFace: 'Arial',
            valign: 'left',
            lineSpacing: 46 // Tăng khoảng cách giữa 2 dòng
          });

          // Các slide câu hỏi
          this.slideshowQuestions.forEach((question, index) => {
            const slide = pptx.addSlide();
            
            // Tiêu đề slide
            slide.addText(`Câu hỏi ${index + 1}`, {
              x: 0.5,
              y: 0.3,
              w: '90%',
              fontSize: 20,
              bold: true,
              color: '2E86AB'
            });

            // Thông tin người hỏi
            slide.addText(`Hành giả: ${question.name || 'Ẩn danh'}`, {
              x: 0.5,
              y: 0.8,
              w: '90%',
              fontSize: 16,
              bold: true,
              color: '000000'
            });

            // Nội dung câu hỏi - PHƯƠNG PHÁP MỚI: Tách thành từng dòng
            const content = this.getQuestionContent(question);
            
            // Tách nội dung thành các dòng
            const lines = content.split('\n').filter(line => line.trim() !== '');
            
            let currentY = 1.5;
            const lineHeight = 0.4; // Chiều cao mỗi dòng
            
            lines.forEach((line, lineIndex) => {
              if (currentY + lineHeight <= 6.5) { // Giới hạn chiều cao slide
                slide.addText(line, {
                  x: 0.9,
                  y: currentY,
                  w: '95%',
                  h: lineHeight,
                  fontSize: 14,
                  color: '333333',
                  align: 'left',
                  valign: 'top',
                  lineSpacing: 6,
                  bullet: false
                });
                currentY += lineHeight;
              }
            });

            // Footer với số trang
            slide.addText(`Trang ${index + 2}`, {
              x: 0.5,
              y: 6.8,
              w: '90%',
              fontSize: 10,
              color: '666666',
              align: 'center'
            });
          });

          // Tải file xuống
          const fileName = `Slide-Hoi-Dap-Phap-Phap-${new Date().toISOString().split('T')[0]}.pptx`;
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
              .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
              .map(q => ({
                ...q,
                // THÊM DÒNG NÀY: Đảm bảo edited_content không bị null/undefined
                edited_content: q.edited_content || q.content
              }));
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

          this.answeredQuestions.add(question.id);
          
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

      // THÊM METHOD MỚI - Kiểm tra câu hỏi đã được đánh dấu chưa
      isQuestionAnswered: function(question) {
        return this.answeredQuestions.has(question.id) || question.status === 'answered';
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
          
          // THÊM DÒNG NÀY - Đánh dấu câu hỏi đã trả lời
          this.answeredQuestions.add(this.currentQuestion.id);
          
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