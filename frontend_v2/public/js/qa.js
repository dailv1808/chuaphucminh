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
      sortBy: 'newest_created',
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
      // Biến cho chức năng chọn nhiều
      selectedQuestions: [],
      selectAll: false,
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

      // Hàm chọn/bỏ chọn tất cả
      toggleSelectAll: function() {
        if (this.selectAll) {
          this.selectedQuestions = [...this.paginatedQuestions.map(q => q.id)];
        } else {
          this.selectedQuestions = [];
        }
      },

      // Hàm chọn/bỏ chọn một câu hỏi
      toggleSelectQuestion: function(questionId) {
        const index = this.selectedQuestions.indexOf(questionId);
        if (index > -1) {
          this.selectedQuestions.splice(index, 1);
        } else {
          this.selectedQuestions.push(questionId);
        }
      },

      // Hàm kiểm tra xem câu hỏi có được chọn không
      isSelected: function(questionId) {
        return this.selectedQuestions.includes(questionId);
      },

      // Hàm xóa nhiều câu hỏi
      deleteMultipleQuestions: async function() {
        if (this.selectedQuestions.length === 0) {
          this.showNotificationMessage('Vui lòng chọn ít nhất một câu hỏi để xóa', 'error');
          return;
        }

        if (!confirm(`Bạn có chắc chắn muốn xóa ${this.selectedQuestions.length} câu hỏi đã chọn?`)) {
          return;
        }

        const token = localStorage.getItem('access_token');
        
        try {
          // Xóa từng câu hỏi
          for (const questionId of this.selectedQuestions) {
            const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${questionId}/`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Xóa câu hỏi ${questionId} thất bại`);
          }
          
          this.showNotificationMessage(`Đã xóa thành công ${this.selectedQuestions.length} câu hỏi`, 'success');
          this.selectedQuestions = []; // Reset danh sách chọn
          this.selectAll = false;
          this.fetchQuestions(); // Tải lại danh sách
          
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        }
      },


      // Thêm vào trong Alpine.data('qaData', function() { ... }), sau các hàm khác

      // Hàm nhân đôi câu hỏi
      // duplicateQuestion: async function(question) {
      //   const token = localStorage.getItem('access_token');
      //   const user = JSON.parse(localStorage.getItem('user'));
        
      //   try {
      //     // Đếm số bản sao hiện có của câu hỏi này
      //     const duplicateCount = this.questions.filter(q => 
      //       q.name.startsWith(question.name + ' (bản sao')
      //     ).length;
          
      //     const newDuplicateNumber = duplicateCount + 1;
      //     const newName = `${question.name} (bản sao ${newDuplicateNumber})`;

      //     // Tạo bản sao của câu hỏi, giữ nguyên mọi tham số
      //     const duplicatedQuestion = {
      //       ...question,
      //       name: newName,
      //       updated_at: new Date().toISOString(), // Chỉ cập nhật thời gian sửa
      //       updated_by: user?.id || null  // Cập nhật người sửa là người hiện tại
      //     };


  

      //     // Xóa các trường không cần thiết
      //     delete duplicatedQuestion.id;
      //     delete duplicatedQuestion.showAnswerSection;
      //     delete duplicatedQuestion.newAnswer;
      //     delete duplicatedQuestion.created_by_obj;
      //     delete duplicatedQuestion.updated_by_obj;

      //     const response = await fetch('https://api.chuaphucminh.xyz/api/questions/', {
      //       method: 'POST',
      //       headers: { 
      //         'Content-Type': 'application/json',
      //         'Authorization': `Bearer ${token}`
      //       },
      //       body: JSON.stringify(duplicatedQuestion)
      //     });

      //     if (!response.ok) throw new Error('Nhân đôi câu hỏi thất bại');
          
      //     this.showNotificationMessage('Đã nhân đôi câu hỏi thành công', 'success');
      //     this.fetchQuestions(); // Tải lại danh sách
          
      //   } catch (error) {
      //     console.error('Error:', error);
      //     this.showNotificationMessage(error.message, 'error');
      //   }
      // },

      // Hàm nhân đôi câu hỏi
      duplicateQuestion: async function(question) {
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
          // Đếm số bản sao hiện có của câu hỏi này
          const duplicateCount = this.questions.filter(q => 
            q.name.startsWith(question.name + ' (bản sao')
          ).length;
          
          const newDuplicateNumber = duplicateCount + 1;
          const newName = `${question.name} (bản sao ${newDuplicateNumber})`;

          // Tạo bản sao của câu hỏi, giữ nguyên mọi tham số
          const duplicatedQuestion = {
            ...question,
            name: newName,
            updated_at: new Date().toISOString(), // Chỉ cập nhật thời gian sửa
            updated_by: user?.id || null  // Cập nhật người sửa là người hiện tại
          };

          // Xóa id để tạo bản ghi mới
          delete duplicatedQuestion.id;
          delete duplicatedQuestion.showAnswerSection;
          delete duplicatedQuestion.newAnswer;
          delete duplicatedQuestion.created_by_obj;
          delete duplicatedQuestion.updated_by_obj;

          const response = await fetch('https://api.chuaphucminh.xyz/api/questions/', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(duplicatedQuestion)
          });

          if (!response.ok) throw new Error('Nhân đôi câu hỏi thất bại');
          
          this.showNotificationMessage(`Đã nhân đôi câu hỏi thành "${newName}"`, 'success');
          this.fetchQuestions(); // Tải lại danh sách
          
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        }
      },

      quickEditField: async function(question, field, value) {
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Xác định trường cần cập nhật
        let updateField = field;
        let updateValue = value;
        
        // Đặc biệt xử lý cho trường content - lưu vào edited_content
        if (field === 'content') {
          updateField = 'edited_content';
          updateValue = value;
          // Cập nhật ngay lập tức trên giao diện
          question.edited_content = value;
        } else {
          question[field] = value;
        }

        const payload = {
          [updateField]: updateValue,
          updated_at: new Date().toISOString(),
          updated_by: user?.id || null
        };

        try {
          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${question.id}/`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error('Cập nhật thất bại');
          }
          
          // Cập nhật lại toàn bộ dữ liệu từ server
          const updatedQuestion = await response.json();
          Object.assign(question, updatedQuestion);
          
          // Nếu đang mở modal chi tiết, cập nhật luôn selectedQuestion
          if (this.showDetailModal && this.selectedQuestion.id === question.id) {
            this.selectedQuestion.edited_content = question.edited_content;
          }
          
          this.showNotificationMessage('Cập nhật thành công', 'success');
        } catch (error) {
          console.error('Error:', error);
          // Rollback giá trị nếu có lỗi
          if (field === 'content') {
            question.edited_content = oldValue;
          } else {
            question[field] = oldValue;
          }
          this.showNotificationMessage(error.message, 'error');
        }
      },

      // Thêm vào trong Alpine.data('qaData', function() { ... }), sau hàm quickEditField

      // Hàm tự động lưu cho modal chỉnh sửa
      autoSaveEditModal: _.debounce(async function() {
        if (!this.isEditing || !this.currentQuestion.id) return;
        
        console.log('Auto saving edit modal...');
        
        // Kiểm tra dữ liệu bắt buộc
        if (!this.currentQuestion.name?.trim() || !this.currentQuestion.content?.trim()) {
          return; // Không hiển thị lỗi, chỉ không lưu
        }

        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
          // Chuẩn bị payload
          const payload = { 
            ...this.currentQuestion,
            updated_by: user?.id || null,
            updated_at: new Date().toISOString()
          };

          // Cập nhật answered_at nếu có câu trả lời
          if (payload.answer && !payload.answered_at) {
            payload.answered_at = new Date().toISOString();
            payload.status = 'answered';
          } else if (!payload.answer && payload.answered_at) {
            payload.answered_at = null;
            payload.status = 'pending';
          }

          // Clean up payload
          delete payload.showAnswerSection;
          delete payload.newAnswer;
          delete payload.created_by_obj;
          delete payload.updated_by_obj;

          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${this.currentQuestion.id}/`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            throw new Error('Tự động lưu thất bại');
          }
          
          const updatedQuestion = await response.json();
          
          // Cập nhật dữ liệu trong questions array
          const index = this.questions.findIndex(q => q.id === updatedQuestion.id);
          if (index !== -1) {
            this.questions[index] = { ...this.questions[index], ...updatedQuestion };
          }
          
          // Cập nhật filteredQuestions
          this.applyFilters();
          
          this.showTemporaryNotification('Đã tự động lưu thay đổi');
          
        } catch (error) {
          console.error('Error auto-saving edit modal:', error);
          // Không hiển thị thông báo lỗi để không làm phiền người dùng
        }
      }, 1000), // Debounce 1 giây

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





      // Thêm vào trong Alpine.data('qaData', function() { ... })

      exportToExcel: function() {
        try {
          // Tạo dữ liệu cho Excel (định dạng HTML table)
          const tableHeaders = [
            'STT', 'Ngày tạo', 'Pháp Danh', 'Câu hỏi', 'Nội dung đã biên tập',
            'Nội dung rút gọn', 'Liên Lạc', 'Trạng Thái', 'Độ ưu tiên',
            'Ngày sửa', 'Người tạo', 'Người biên tập', 'Slide', 'FAQ',
            'Phân Loại', 'Tags', 'Câu trả lời', 'Ngày trả lời'
          ];

          const tableData = this.filteredQuestions.map((question, index) => [
            (index + 1).toString(),
            this.formatDate(question.created_at),
            this.escapeExcelValue(question.name),
            this.escapeExcelValue(question.content),
            this.escapeExcelValue(question.edited_content || question.content),
            this.escapeExcelValue(question.short_content || ''),
            this.escapeExcelValue(question.contact || 'N/A'),
            this.getStatusLabel(question.status),
            this.priorityOptions.find(p => p.value === question.priority)?.label || question.priority,
            this.formatDate(question.updated_at),
            question.created_by?.full_name || question.created_by?.username || 'Khách',
            question.updated_by?.full_name || question.updated_by?.username || 'Khách',
            question.slideshow ? 'Có' : 'Không',
            question.is_faq ? 'Có' : 'Không',
            question.group || 'N/A',
            question.tags || 'N/A',
            this.escapeExcelValue(question.answer || ''),
            question.answered_at ? this.formatDate(question.answered_at) : 'N/A'
          ]);

          // Tạo nội dung CSV
          const csvContent = this.generateCSVContent(tableHeaders, tableData);
          
          // Tạo và tải file
          this.downloadFile(csvContent, 'questions.csv', 'text/csv;charset=utf-8;');
          
          this.showNotificationMessage('Xuất file Excel thành công!', 'success');
          
        } catch (error) {
          console.error('Error exporting to Excel:', error);
          this.showNotificationMessage('Lỗi khi xuất file: ' + error.message, 'error');
        }
      },

      // Hàm hỗ trợ: Escape giá trị cho CSV
      escapeExcelValue: function(value) {
        if (value === null || value === undefined) return '';
        
        const stringValue = String(value);
        // Nếu giá trị chứa dấu phẩy, xuống dòng, hoặc dấu ngoặc kép, thì bọc trong ngoặc kép
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"') || stringValue.includes('\r')) {
          return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
      },

      // Hàm tạo nội dung CSV
      generateCSVContent: function(headers, data) {
        const headerRow = headers.map(header => this.escapeExcelValue(header)).join(',');
        const dataRows = data.map(row => row.join(','));
        
        // Thêm BOM để hiển thị tiếng Việt đúng trong Excel
        return '\uFEFF' + [headerRow, ...dataRows].join('\n');
      },

      // Hàm tải file
      downloadFile: function(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Giải phóng bộ nhớ
        setTimeout(() => URL.revokeObjectURL(url), 100);
      },

      // Thêm hàm format date chi tiết hơn cho export
      formatDateForExport: function(dateString) {
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
















      fetchQuestions: function() {
        this.isLoading = true;
        const token = localStorage.getItem('access_token');
        fetch('https://api.chuaphucminh.xyz/api/questions/', {
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
              edited_content: q.edited_content || q.content, // Set edited_content to content if empty
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
        this.selectedQuestion = {
          ...question,
          // Sử dụng edited_content nếu có, nếu không thì dùng content
          edited_content: question.edited_content || question.content || ''
        };
        this.currentQuestionIndex = this.filteredQuestions.findIndex(q => q.id === question.id);
        this.showDetailModal = true;
      },



      // // Hàm tự động lưu khi người dùng nhập liệu (debounce 500ms)
      // handleEditContent: _.debounce(async function() {
      //   if (!this.selectedQuestion) return;
        
      //   const token = localStorage.getItem('access_token');
      //   const user = JSON.parse(localStorage.getItem('user'));
        
      //   try {
      //     const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${this.selectedQuestion.id}/`, {
      //       method: 'PATCH',
      //       headers: { 
      //         'Authorization': `Bearer ${token}`,
      //         'Content-Type': 'application/json'
      //       },
      //       body: JSON.stringify({
      //         edited_content: this.selectedQuestion.edited_content,
      //         updated_at: new Date().toISOString(),
      //         updated_by: user?.id || null
      //       })
      //     });

      //     if (!response.ok) throw new Error('Cập nhật thất bại');
          
      //     // Cập nhật ngay trên giao diện không cần reload
      //     const index = this.questions.findIndex(q => q.id === this.selectedQuestion.id);
      //     if (index !== -1) {
      //       this.questions[index].edited_content = this.selectedQuestion.edited_content;
      //       this.questions[index].updated_at = new Date().toISOString();
      //     }
          
      //     // Hiển thị thông báo nhỏ không làm phiền người dùng
      //     this.showTemporaryNotification('Đã tự động lưu thay đổi');
      //   } catch (error) {
      //     console.error('Error:', error);
      //     this.showNotificationMessage('Lỗi khi lưu thay đổi: ' + error.message, 'error');
      //   }
      // }, 500), // Debounce 500ms

      // // Thông báo nhỏ không làm phiền
      // showTemporaryNotification: function(message) {
      //   const tempNoti = document.createElement('div');
      //   tempNoti.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg text-sm';
      //   tempNoti.textContent = message;
      //   document.body.appendChild(tempNoti);
        
      //   setTimeout(() => {
      //     tempNoti.classList.add('opacity-0', 'transition-opacity', 'duration-300');
      //     setTimeout(() => tempNoti.remove(), 300);
      //   }, 2000);
      // },

      // Hàm tự động lưu khi người dùng nhập liệu (debounce 500ms)
      handleEditContent: _.debounce(async function() {
        if (!this.selectedQuestion) return;
        
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${this.selectedQuestion.id}/`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              edited_content: this.selectedQuestion.edited_content,
              updated_at: new Date().toISOString(),
              updated_by: user?.id || null
            })
          });

          if (!response.ok) throw new Error('Cập nhật thất bại');
          
          // Cập nhật ngay trên giao diện không cần reload
          const index = this.questions.findIndex(q => q.id === this.selectedQuestion.id);
          if (index !== -1) {
            this.questions[index].edited_content = this.selectedQuestion.edited_content;
            this.questions[index].updated_at = new Date().toISOString();
          }
          
          // Hiển thị thông báo nhỏ không làm phiền người dùng
          this.showTemporaryNotification('Đã tự động lưu thay đổi');
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage('Lỗi khi lưu thay đổi: ' + error.message, 'error');
        }
      }, 500), // Debounce 500ms

      // Thông báo nhỏ không làm phiền
      showTemporaryNotification: function(message) {
        const tempNoti = document.createElement('div');
        tempNoti.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg text-sm';
        tempNoti.textContent = message;
        document.body.appendChild(tempNoti);
        
        setTimeout(() => {
          tempNoti.classList.add('opacity-0', 'transition-opacity', 'duration-300');
          setTimeout(() => tempNoti.remove(), 300);
        }, 2000);
      },





      updateEditedContent: async function() {
        if (!this.selectedQuestion) return;
        
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${this.selectedQuestion.id}/`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              edited_content: this.selectedQuestion.edited_content,
              updated_at: new Date().toISOString(),
              updated_by: user?.id || null
            })
          });

          if (!response.ok) throw new Error('Cập nhật thất bại');
          
          const updatedQuestion = await response.json();
          // Cập nhật lại danh sách câu hỏi
          const index = this.questions.findIndex(q => q.id === updatedQuestion.id);
          if (index !== -1) {
            this.questions[index].edited_content = updatedQuestion.edited_content;
            this.questions[index].updated_at = updatedQuestion.updated_at;
            this.questions[index].updated_by = updatedQuestion.updated_by;
          }
          
          this.showNotificationMessage('Cập nhật nội dung thành công', 'success');
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        }
      },

      applyFilters: function() {
        // this.currentPage = 1;
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
            (q.edited_content && q.edited_content.toLowerCase().includes(query)) ||
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
          edited_content: '', // Will be set to content when saving
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
        this.currentQuestion = JSON.parse(JSON.stringify({
          ...question,
          edited_content: question.edited_content || question.content
        }));
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

        // Set edited_content to content if empty
        if (!this.currentQuestion.edited_content) {
          this.currentQuestion.edited_content = this.currentQuestion.content;
        }

        const payload = this.preparePayload();
        this.isEditing ? this.updateQuestion(payload) : this.createQuestion(payload);
      },



      preparePayload: function() {
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Đảm bảo edited_content luôn có giá trị
        if (!this.currentQuestion.edited_content) {
          this.currentQuestion.edited_content = this.currentQuestion.content;
        }
        
        const payload = { 
          ...this.currentQuestion,
          edited_content: this.currentQuestion.edited_content, // Đảm bảo gửi edited_content
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
        fetch('https://api.chuaphucminh.xyz/api/questions/', {
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
        fetch(`https://api.chuaphucminh.xyz/api/questions/${this.currentQuestion.id}/`, {
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
        fetch(`https://api.chuaphucminh.xyz/api/questions/${this.currentQuestion.id}/`, {
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


      // THAY THẾ HOÀN TOÀN HÀM navigateQuestion VÀ CÁC HÀM LIÊN QUAN:
      navigateQuestion: async function(direction) {
        // Nếu đang ở modal chỉnh sửa, tự động lưu trước khi chuyển
        if (this.showQuestionModal && this.isEditing) {
          await this.autoSaveAndNavigate(direction);
        } else {
          // Nếu đang ở modal xem chi tiết, chuyển ngay không cần lưu
          this.navigateToQuestion(direction);
        }
      },




      // HÀM TỰ ĐỘNG LƯU VÀ CHUYỂN CÂU HỎI
      autoSaveAndNavigate: async function(direction) {
        console.log('Auto saving and navigating...');
        
        // Kiểm tra dữ liệu bắt buộc
        if (!this.currentQuestion.name?.trim() || !this.currentQuestion.content?.trim()) {
          this.showNotificationMessage('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
          return;
        }

        // Đảm bảo edited_content có giá trị
        if (!this.currentQuestion.edited_content?.trim()) {
          this.currentQuestion.edited_content = this.currentQuestion.content;
        }

        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
          // Chuẩn bị payload - sử dụng cùng logic với saveQuestion
          const payload = { 
            ...this.currentQuestion,
            updated_by: user?.id || null,
            updated_at: new Date().toISOString()
          };

          // Cập nhật answered_at nếu có câu trả lời
          if (payload.answer && !payload.answered_at) {
            payload.answered_at = new Date().toISOString();
            payload.status = 'answered';
          } else if (!payload.answer && payload.answered_at) {
            payload.answered_at = null;
            payload.status = 'pending';
          }

          // Clean up payload
          delete payload.showAnswerSection;
          delete payload.newAnswer;
          delete payload.created_by_obj;
          delete payload.updated_by_obj;

          console.log('Saving payload:', payload);

          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${this.currentQuestion.id}/`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Cập nhật thất bại: ${response.status} - ${errorText}`);
          }
          
          const updatedQuestion = await response.json();
          console.log('Save successful:', updatedQuestion);
          
          // CẬP NHẬT DỮ LIỆU NGAY LẬP TỨC TRONG questions ARRAY
          const index = this.questions.findIndex(q => q.id === updatedQuestion.id);
          if (index !== -1) {
            this.questions[index] = { ...this.questions[index], ...updatedQuestion };
          }
          
          this.showTemporaryNotification('Đã tự động lưu thay đổi');
          
          // Sau khi lưu thành công, chuyển sang câu hỏi tiếp theo
          this.navigateToQuestion(direction);
          
        } catch (error) {
          console.error('Error auto-saving:', error);
          this.showNotificationMessage('Lỗi khi tự động lưu: ' + error.message, 'error');
        }
      },


      

      // HÀM CHUYỂN CÂU HỎI
      navigateToQuestion: function(direction) {
        const newIndex = this.currentQuestionIndex + direction;
        if (newIndex >= 0 && newIndex < this.filteredQuestions.length) {
          const question = this.filteredQuestions[newIndex];
          if (this.showDetailModal) {
            // Đối với modal chi tiết
            this.showQuestionDetail(question);
          } else if (this.showQuestionModal && this.isEditing) {
            // Đối với modal chỉnh sửa - cập nhật currentQuestion mà không đóng modal
            this.currentQuestion = JSON.parse(JSON.stringify({
              ...question,
              edited_content: question.edited_content || question.content
            }));
            this.currentQuestionIndex = newIndex;
          }
        }
      },



      



      // Thêm hàm tự động lưu
      autoSaveCurrentQuestion: async function() {
        if (!this.currentQuestion.id) return;
        
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
          const payload = this.preparePayload();
          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${this.currentQuestion.id}/`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) throw new Error('Tự động lưu thất bại');
          
          // Cập nhật lại danh sách câu hỏi
          const updatedQuestion = await response.json();
          const index = this.questions.findIndex(q => q.id === updatedQuestion.id);
          if (index !== -1) {
            this.questions[index] = { ...this.questions[index], ...updatedQuestion };
          }
          
          // Cập nhật filteredQuestions để giữ nguyên bộ lọc và phân trang
          this.updateFilteredQuestions();
          
          this.showTemporaryNotification('Đã tự động lưu thay đổi');
        } catch (error) {
          console.error('Error auto-saving:', error);
          this.showNotificationMessage('Lỗi khi tự động lưu: ' + error.message, 'error');
        }
      },

      // Thêm hàm cập nhật filteredQuestions mà không reset trang
      updateFilteredQuestions: function() {
        this.sortAndFilterQuestions();
        // KHÔNG reset currentPage ở đây
      },

 

      // Thêm hàm kiểm tra thay đổi
      hasChanges: function() {
        if (!this.currentQuestion || !this.currentQuestion.id) return false;
        
        const originalQuestion = this.questions.find(q => q.id === this.currentQuestion.id);
        if (!originalQuestion) return false;
        
        // So sánh các trường quan trọng để xem có thay đổi không
        return this.currentQuestion.name !== originalQuestion.name ||
              this.currentQuestion.content !== originalQuestion.content ||
              this.currentQuestion.edited_content !== originalQuestion.edited_content ||
              this.currentQuestion.answer !== originalQuestion.answer ||
              this.currentQuestion.status !== originalQuestion.status ||
              this.currentQuestion.priority !== originalQuestion.priority ||
              this.currentQuestion.slideshow !== originalQuestion.slideshow ||
              this.currentQuestion.is_faq !== originalQuestion.is_faq ||
              this.currentQuestion.group !== originalQuestion.group ||
              this.currentQuestion.tags !== originalQuestion.tags;
      },

      // Thêm hàm tự động lưu
      autoSaveCurrentQuestion: async function() {
        if (!this.currentQuestion.id) return;
        
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
          const payload = this.preparePayload();
          const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${this.currentQuestion.id}/`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`, 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify(payload)
          });

          if (!response.ok) throw new Error('Tự động lưu thất bại');
          
          // Cập nhật lại danh sách câu hỏi
          const updatedQuestion = await response.json();
          const index = this.questions.findIndex(q => q.id === updatedQuestion.id);
          if (index !== -1) {
            this.questions[index] = { ...this.questions[index], ...updatedQuestion };
          }
          
          this.showTemporaryNotification('Đã tự động lưu thay đổi');
        } catch (error) {
          console.error('Error auto-saving:', error);
          this.showNotificationMessage('Lỗi khi tự động lưu: ' + error.message, 'error');
        }
      },



      // Thay thế hàm handleKeyNavigation hiện tại
      handleKeyNavigation: function(event) {
        if ((this.showDetailModal || this.showQuestionModal) && event.ctrlKey) {
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