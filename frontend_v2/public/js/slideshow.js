function slideshowData() {
    return {
        // State
        slideshowQuestions: [],
        currentSlideIndex: 0,
        isSlideshowActive: false,
        youtubeLink: '',
        showNotification: false,
        notificationMessage: '',
        notificationType: 'success',
        isLoading: true,
        youtubePlayer: null,

        // Initialize
        async init() {
            await this.loadSlideshowQuestions();
            this.setupKeyboardListeners();
            
            // Load YouTube API
            this.loadYouTubeAPI();
        },

        // Load YouTube API
        loadYouTubeAPI() {
            if (!window.YT) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            window.onYouTubeIframeAPIReady = () => {
                this.initializeYouTubePlayer();
            };

            // If YouTube API is already loaded
            if (window.YT && window.YT.Player) {
                this.initializeYouTubePlayer();
            }
        },

        // Initialize YouTube Player
        initializeYouTubePlayer() {
            const playerElement = document.getElementById('youtube-player');
            if (playerElement && !this.youtubePlayer) {
                this.youtubePlayer = new YT.Player('youtube-player', {
                    height: '0',
                    width: '0',
                    videoId: this.extractVideoId(this.youtubeLink),
                    playerVars: {
                        'playsinline': 1,
                        'enablejsapi': 1,
                        'origin': window.location.origin
                    },
                    events: {
                        'onReady': this.onPlayerReady.bind(this),
                        'onStateChange': this.onPlayerStateChange.bind(this)
                    }
                });
            }
        },

        // Extract video ID from YouTube URL
        extractVideoId(url) {
            if (!url) return '';
            
            const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
            const match = url.match(regex);
            return match ? match[1] : '';
        },

        onPlayerReady(event) {
            console.log('YouTube Player ready');
        },

        onPlayerStateChange(event) {
            // Handle player state changes if needed
        },

        // Load slideshow questions from localStorage
        async loadSlideshowQuestions() {
            try {
                this.isLoading = true;
                
                // Get slideshow question IDs from localStorage
                const slideshowIds = JSON.parse(localStorage.getItem('slideshowQuestions') || '[]');
                
                if (slideshowIds.length === 0) {
                    this.slideshowQuestions = [];
                    this.isLoading = false;
                    return;
                }

                // Get all questions from localStorage
                const allQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
                
                // Filter questions that are in slideshow and sort by oldest first (theo thứ tự cũ nhất trước)
                const slideshowQuestions = allQuestions
                    .filter(q => slideshowIds.includes(q.id) && !q.answered)
                    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); // Sắp xếp theo thời gian tạo (cũ nhất trước)

                this.slideshowQuestions = slideshowQuestions;
            } catch (error) {
                console.error('Error loading slideshow questions:', error);
                this.showNotification('Có lỗi xảy ra khi tải câu hỏi trình chiếu', 'error');
            } finally {
                this.isLoading = false;
            }
        },

        // Get question content - ưu tiên lấy giá trị đã biên tập, nếu trống thì lấy giá trị gốc
        getQuestionContent(question) {
            return question.editedContent && question.editedContent.trim() !== '' 
                ? question.editedContent 
                : question.content;
        },

        // Start slideshow
        startSlideshow() {
            if (this.slideshowQuestions.length === 0) {
                this.showNotification('Không có câu hỏi nào để trình chiếu', 'error');
                return;
            }

            if (!this.youtubeLink) {
                this.showNotification('Vui lòng nhập link YouTube livestream', 'error');
                return;
            }

            this.currentSlideIndex = 0;
            this.isSlideshowActive = true;

            // Initialize or update YouTube player with new video
            const videoId = this.extractVideoId(this.youtubeLink);
            if (videoId) {
                if (this.youtubePlayer) {
                    this.youtubePlayer.loadVideoById(videoId);
                } else {
                    this.initializeYouTubePlayer();
                }
            }

            this.showNotification('Bắt đầu trình chiếu', 'success');
        },

        // Stop slideshow
        stopSlideshow() {
            this.isSlideshowActive = false;
            this.currentSlideIndex = 0;
            
            if (this.youtubePlayer) {
                this.youtubePlayer.stopVideo();
            }
            
            this.showNotification('Đã dừng trình chiếu', 'success');
        },

        // Next slide
        nextSlide() {
            if (this.currentSlideIndex < this.slideshowQuestions.length) {
                this.currentSlideIndex++;
            }
        },

        // Previous slide
        prevSlide() {
            if (this.currentSlideIndex > 0) {
                this.currentSlideIndex--;
            }
        },

        // Get current question
        get currentQuestion() {
            if (this.currentSlideIndex === 0) return null;
            return this.slideshowQuestions[this.currentSlideIndex - 1];
        },

        // Mark question as answered
        async markAsAnswered(question) {
            try {
                // Update in main questions list
                const allQuestions = JSON.parse(localStorage.getItem('questions') || '[]');
                const questionIndex = allQuestions.findIndex(q => q.id === question.id);
                
                if (questionIndex !== -1) {
                    allQuestions[questionIndex].answered = true;
                    allQuestions[questionIndex].answeredAt = new Date().toISOString();
                    localStorage.setItem('questions', JSON.stringify(allQuestions));
                }

                // Remove from slideshow
                await this.removeFromSlideshow(question);
                
                this.showNotification('Đã đánh dấu câu hỏi là đã trả lời', 'success');
            } catch (error) {
                console.error('Error marking question as answered:', error);
                this.showNotification('Có lỗi xảy ra khi đánh dấu câu hỏi', 'error');
            }
        },

        // Save current timestamp (for answered questions)
        saveCurrentTimestamp() {
            if (this.currentQuestion) {
                this.markAsAnswered(this.currentQuestion);
                
                // Auto move to next slide after marking as answered
                if (this.currentSlideIndex < this.slideshowQuestions.length) {
                    this.nextSlide();
                }
            }
        },

        // Remove question from slideshow
        async removeFromSlideshow(question) {
            try {
                // Remove from slideshow IDs in localStorage
                const slideshowIds = JSON.parse(localStorage.getItem('slideshowQuestions') || '[]');
                const updatedIds = slideshowIds.filter(id => id !== question.id);
                localStorage.setItem('slideshowQuestions', JSON.stringify(updatedIds));

                // Remove from current slideshow list
                this.slideshowQuestions = this.slideshowQuestions.filter(q => q.id !== question.id);

                this.showNotification('Đã xóa câu hỏi khỏi trình chiếu', 'success');
            } catch (error) {
                console.error('Error removing question from slideshow:', error);
                this.showNotification('Có lỗi xảy ra khi xóa câu hỏi', 'error');
            }
        },

        // Setup keyboard listeners
        setupKeyboardListeners() {
            document.addEventListener('keydown', (event) => {
                if (!this.isSlideshowActive) return;

                switch (event.key.toLowerCase()) {
                    case 'n': // Next
                        event.preventDefault();
                        this.nextSlide();
                        break;
                    case 'p': // Previous
                        event.preventDefault();
                        this.prevSlide();
                        break;
                    case 'r': // Mark as answered
                        event.preventDefault();
                        this.saveCurrentTimestamp();
                        break;
                    case 's': // Stop
                        event.preventDefault();
                        this.stopSlideshow();
                        break;
                }
            });
        },

        // Show notification
        showNotification(message, type = 'success') {
            this.notificationMessage = message;
            this.notificationType = type;
            this.showNotification = true;

            setTimeout(() => {
                this.showNotification = false;
            }, 3000);
        },

        // Download PowerPoint
        async downloadPowerPoint() {
            try {
                if (this.slideshowQuestions.length === 0) {
                    this.showNotification('Không có câu hỏi nào để tạo PowerPoint', 'error');
                    return;
                }

                const pptx = new PptxGenJS();

                // Slide chào mừng
                const welcomeSlide = pptx.addSlide();
                welcomeSlide.background = { fill: 'FFFFFF' };
                
                welcomeSlide.addText('HỎI PHÁP\nTRÌNH PHÁP', {
                    x: 0.5,
                    y: 2,
                    w: '90%',
                    h: 2,
                    fontSize: 44,
                    bold: true,
                    color: '0070C0',
                    align: 'center',
                    fontFace: 'Arial'
                });

                // Thêm các slide câu hỏi
                this.slideshowQuestions.forEach((question, index) => {
                    const slide = pptx.addSlide();
                    slide.background = { fill: 'FFFFFF' };

                    // Tiêu đề slide
                    slide.addText(`Câu hỏi ${index + 1}`, {
                        x: 0.5,
                        y: 0.5,
                        w: '90%',
                        fontSize: 20,
                        bold: true,
                        color: '0070C0',
                        fontFace: 'Arial'
                    });

                    // Thông tin người gửi
                    slide.addText(`Câu hỏi của hành giả: ${question.name}`, {
                        x: 0.5,
                        y: 1.2,
                        w: '90%',
                        fontSize: 16,
                        color: '444444',
                        fontFace: 'Arial'
                    });

                    // Nội dung câu hỏi (giữ nguyên định dạng xuống dòng)
                    const questionContent = this.getQuestionContent(question);
                    slide.addText(questionContent, {
                        x: 0.5,
                        y: 2,
                        w: '90%',
                        h: 4,
                        fontSize: 18,
                        color: '000000',
                        fontFace: 'Arial',
                        align: 'left',
                        valign: 'top'
                    });
                });

                // Tải file
                const fileName = `Trinh_Chieu_Hoi_Dap_${new Date().toISOString().split('T')[0]}.pptx`;
                await pptx.writeFile({ fileName });
                
                this.showNotification('Đã tải file PowerPoint thành công', 'success');
            } catch (error) {
                console.error('Error generating PowerPoint:', error);
                this.showNotification('Có lỗi xảy ra khi tạo PowerPoint', 'error');
            }
        }
    };
}