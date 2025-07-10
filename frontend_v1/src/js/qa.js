document.addEventListener('alpine:init', function() {
  Alpine.data('qaData', function() {
    return {
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
        short_content: '',
        answer: '',
        answered_at: null,
        status: 'pending',
        priority: 'medium',
        group: null,
        tags: [],
        created_at: new Date().toISOString()
      },

      // Khởi tạo
      init: function() {
        this.fetchQuestions();
      },

      // Lấy danh sách câu hỏi từ API
      fetchQuestions: function() {
        var self = this;
        self.isLoading = true;
        fetch('http://192.168.0.200:8000/api/questions/')
          .then(function(response) {
            if (!response.ok) throw new Error('Lỗi khi tải danh sách câu hỏi');
            return response.json();
          })
          .then(function(data) {
            self.questions = data;
            self.sortAndFilterQuestions();
          })
          .catch(function(error) {
            console.error('Error:', error);
            self.showNotificationMessage(error.message, 'error');
          })
          .finally(function() {
            self.isLoading = false;
          });
      },

      // Sắp xếp và lọc câu hỏi
      sortAndFilterQuestions: function() {
        var results = this.questions.slice();
        
        // Lọc theo từ khóa tìm kiếm
        if (this.searchQuery) {
          var query = this.searchQuery.toLowerCase();
          results = results.filter(function(q) {
            return q.name.toLowerCase().includes(query) || 
                   q.content.toLowerCase().includes(query) ||
                   (q.short_content && q.short_content.toLowerCase().includes(query)) ||
                   (q.answer && q.answer.toLowerCase().includes(query));
          });
        }
        
        // Sắp xếp theo thứ tự ưu tiên
        results.sort(function(a, b) {
          // Ưu tiên câu hỏi chưa trả lời
          if (a.status === 'pending' && b.status !== 'pending') return -1;
          if (a.status !== 'pending' && b.status === 'pending') return 1;
          
          // Sắp xếp theo thời gian trả lời (mới nhất trước)
          if (a.answered_at && b.answered_at) {
            var dateA = new Date(a.answered_at);
            var dateB = new Date(b.answered_at);
            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;
          } else if (a.answered_at) return -1;
          else if (b.answered_at) return 1;
          
          // Sắp xếp theo độ ưu tiên (cao nhất trước)
          var priorityOrder = { high: 3, medium: 2, low: 1 };
          if (priorityOrder[a.priority] > priorityOrder[b.priority]) return -1;
          if (priorityOrder[a.priority] < priorityOrder[b.priority]) return 1;
          
          // Cuối cùng sắp xếp theo thời gian tạo (mới nhất trước)
          return new Date(b.created_at) - new Date(a.created_at);
        });
        
        this.filteredQuestions = results;
      },

      // Cập nhật thời gian trả lời khi có nội dung câu trả lời
      updateAnsweredAt: function() {
        if (this.currentQuestion.answer && !this.currentQuestion.answered_at) {
          this.currentQuestion.answered_at = new Date().toISOString();
          this.currentQuestion.status = 'answered';
        } else if (!this.currentQuestion.answer) {
          this.currentQuestion.answered_at = null;
          this.currentQuestion.status = 'pending';
        }
      },

      // Mở modal thêm mới câu hỏi
      openAddQuestionModal: function() {
        this.isEditing = false;
        this.currentQuestion = {
          id: null,
          name: '',
          email: '',
          content: '',
          short_content: '',
          answer: '',
          answered_at: null,
          status: 'pending',
          priority: 'medium',
          group: null,
          tags: [],
          created_at: new Date().toISOString()
        };
        this.showQuestionModal = true;
      },

      // Mở modal chỉnh sửa câu hỏi
      openEditQuestionModal: function(question) {
        this.isEditing = true;
        this.currentQuestion = JSON.parse(JSON.stringify(question));
        if (Array.isArray(this.currentQuestion.tags)) {
          this.currentQuestion.tags = this.currentQuestion.tags.join(', ');
        }
        this.showQuestionModal = true;
      },

      // Đóng modal câu hỏi
      closeQuestionModal: function() {
        this.showQuestionModal = false;
      },

      // Xử lý khi lưu câu hỏi (thêm mới hoặc cập nhật)
      saveQuestion: function() {
        // Validate các trường bắt buộc
        if (!this.currentQuestion.name.trim() || !this.currentQuestion.content.trim()) {
          this.showNotificationMessage('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
          return;
        }

        if (this.isEditing) {
          this.updateQuestion();
        } else {
          this.createQuestion();
        }
      },

      // Gọi API để tạo câu hỏi mới
      createQuestion: function() {
        var self = this;
        var payload = this.preparePayload();

        fetch('http://192.168.0.200:8000/api/questions/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        })
        .then(function(response) {
          if (!response.ok) throw new Error('Thêm mới thất bại');
          return response.json();
        })
        .then(function() {
          self.showNotificationMessage('Thêm câu hỏi mới thành công', 'success');
          self.showQuestionModal = false;
          return self.fetchQuestions();
        })
        .catch(function(error) {
          console.error('Error:', error);
          self.showNotificationMessage(error.message, 'error');
        });
      },




	// Gọi API để cập nhật câu hỏi (PUT)
	updateQuestion: function() {
	  var self = this;
	  var payload = this.preparePayload();
	  
	  console.log('Preparing to update question with payload:', payload); // Log payload trước khi gửi

	  fetch('http://192.168.0.200:8000/api/questions/' + this.currentQuestion.id + '/', {
	    method: 'PUT',
	    headers: {
	      'Content-Type': 'application/json',
	    },
	    body: JSON.stringify(payload)
	  })
	  .then(function(response) {
	    console.log('Received response status:', response.status); // Log status code
	    
	    // Clone response để có thể đọc nhiều lần
	    const responseClone = response.clone();
	    
	    // Đầu tiên kiểm tra status code
	    if (!response.ok) {
	      // Nếu response không ok, đọc nội dung lỗi chi tiết
	      return responseClone.json().then(errData => {
	        console.error('Error response data:', errData); // Log chi tiết lỗi từ server
	        
	        // Kiểm tra các trường lỗi phổ biến
	        let errorMsg = 'Cập nhật thất bại';
	        if (errData.detail) {
	          errorMsg += `: ${errData.detail}`;
	        } else if (errData.message) {
	          errorMsg += `: ${errData.message}`;
	        } else if (errData.non_field_errors) {
	          errorMsg += `: ${errData.non_field_errors.join(', ')}`;
	        } else {
	          // Kiểm tra từng trường cụ thể
	          for (const field in errData) {
	            if (Array.isArray(errData[field])) {
	              errorMsg += `\n- ${field}: ${errData[field].join(', ')}`;
	            }
	          }
	        }
	        
	        throw new Error(errorMsg);
	      }).catch(() => {
	        // Nếu không parse được JSON, trả về lỗi với status text
	        throw new Error(`Cập nhật thất bại: ${response.status} ${response.statusText}`);
	      });
	    }
	    
	    return response.json();
	  })
	  .then(function(data) {
	    console.log('Update successful with data:', data);
	    self.showNotificationMessage('Cập nhật câu hỏi thành công', 'success');
	    self.showQuestionModal = false;
	    return self.fetchQuestions();
	  })
	  .catch(function(error) {
	    console.error('Error in update process:', error);
	    
	    // Kiểm tra loại lỗi
	    let errorMessage = error.message;
	    
	    if (error instanceof TypeError) {
	      errorMessage = 'Lỗi kết nối mạng hoặc CORS. Kiểm tra console để biết chi tiết.';
	    } else if (error instanceof SyntaxError) {
	      errorMessage = 'Lỗi xử lý dữ liệu từ server.';
	    }
	    
	    self.showNotificationMessage(errorMessage, 'error');
	    
	    // Log thêm thông tin để debug
	    console.group('Error Details');
	    console.error('Error:', error);
	    console.log('Current Question:', self.currentQuestion);
	    console.log('Payload sent:', payload);
	    console.groupEnd();
	  });
	},







	preparePayload: function() {
	  var payload = JSON.parse(JSON.stringify(this.currentQuestion));
	  this.updateAnsweredAt();
	  
	  // Xử lý tags - đảm bảo luôn là array
	  if (payload.tags) {
	    if (typeof payload.tags === 'string') {
	      // Nếu tags là string, chuyển thành array
	      payload.tags = payload.tags.split(',')
	        .map(tag => tag.trim())
	        .filter(tag => tag.length > 0);
	    } else if (!Array.isArray(payload.tags)) {
	      // Nếu tags không phải array, tạo array mới
	      payload.tags = [];
	    }
	  } else {
	    // Nếu tags không tồn tại, khởi tạo array rỗng
	    payload.tags = [];
	  }
	  
	  return payload;
	},






      // Xác nhận xóa câu hỏi
      confirmDelete: function(question) {
        this.currentQuestion = JSON.parse(JSON.stringify(question));
        this.showConfirmModal = true;
      },

      // Xóa câu hỏi
      deleteQuestion: function() {
        var self = this;
        fetch('http://192.168.0.200:8000/api/questions/' + this.currentQuestion.id + '/', {
          method: 'DELETE'
        })
        .then(function(response) {
          if (!response.ok) throw new Error('Xóa câu hỏi thất bại');
          self.showNotificationMessage('Xóa câu hỏi thành công', 'success');
          self.showConfirmModal = false;
          return self.fetchQuestions();
        })
        .catch(function(error) {
          console.error('Error:', error);
          self.showNotificationMessage(error.message, 'error');
        });
      },

      // Định dạng hiển thị ngày giờ
      formatDateTime: function(dateString) {
        if (!dateString) return 'N/A';
        var date = new Date(dateString);
        return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },

      // Hiển thị thông báo
      showNotificationMessage: function(message, type) {
        this.notificationMessage = message;
        this.notificationType = type || 'success';
        this.showNotification = true;
        var self = this;
        setTimeout(function() {
          self.showNotification = false;
        }, 3000);
      }
    };
  });
});
