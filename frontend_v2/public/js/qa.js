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
      isDetectingDuplicates: false,
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
      // Thêm vào các biến hiện có
      showSimilarModal: false,
      currentSimilarQuestion: null,
      similarQuestions: [],
      duplicateFilter: '',
      enableDuplicateCheck: true,
      maxDuplicateCheck: 300,
      duplicateSimilarityThreshold: 0.5,
      duplicateMap: {},
      duplicateCount: 0,
      duplicateDisabledReason: '',
      searchDebounceMs: 500,






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
          const idsToDelete = [...this.selectedQuestions];
          const results = await Promise.all(idsToDelete.map(async (questionId) => {
            const response = await fetch(`https://api.chuaphucminh.xyz/api/questions/${questionId}/`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error(`Xóa câu hỏi ${questionId} thất bại`);
            return questionId;
          }));
          
          this.showNotificationMessage(`Đã xóa thành công ${results.length} câu hỏi`, 'success');
          this.selectedQuestions = []; // Reset danh sách chọn
          this.selectAll = false;

          // Update local state instead of refetching whole list
          const deletedSet = new Set(idsToDelete);
          this.questions = this.questions.filter(q => !deletedSet.has(q.id));
          this.applyFilters();
          setTimeout(() => this.rebuildDuplicateMap(), 0);
          
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        }
      },


      // Hàm lấy tên hiển thị - ưu tiên display_name, nếu không có thì dùng name
      getDisplayName: function(question) {
        return question.display_name || question.name;
      },


      // Hàm nhân đôi câu hỏi - thêm trường display_name
      duplicateQuestion: async function(question) {
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        try {
          // Lấy tên gốc từ question.name (không xử lý gì)
          const baseName = question.name;
          
          // Tìm tất cả các câu hỏi có cùng baseName
          const relatedQuestions = this.questions.filter(q => q.name === baseName);
          
          // Tìm số bản sao cao nhất hiện có
          let maxDuplicateNumber = 0;
          relatedQuestions.forEach(q => {
            // Kiểm tra trong display_name nếu có phần bản sao
            if (q.display_name) {
              const match = q.display_name.match(/\(bản sao\s*(\d+)\)$/);
              if (match) {
                const num = parseInt(match[1]);
                if (num > maxDuplicateNumber) {
                  maxDuplicateNumber = num;
                }
              }
            }
          });
          
          const newDuplicateNumber = maxDuplicateNumber + 1;
          const displayName = `${baseName} (bản sao ${newDuplicateNumber})`;

          // Tạo bản sao của câu hỏi - GIỮ NGUYÊN tất cả các trường khác
          const duplicatedQuestion = {
            name: baseName, // Giữ nguyên tên gốc
            display_name: displayName, // Thêm trường display_name để hiển thị trong trang Q&A
            email: question.email,
            content: question.content,
            edited_content: question.edited_content,
            contact: question.contact,
            answer: question.answer,
            short_content: question.short_content,
            answered_at: question.answered_at, // Giữ nguyên thời gian trả lời
            tags: question.tags,
            group: question.group,
            status: question.status,
            priority: question.priority,
            slideshow: question.slideshow,
            is_faq: question.is_faq,
            created_at: question.created_at, // Giữ nguyên thời gian tạo
            updated_at: question.updated_at, // Giữ nguyên thời gian sửa
            created_by: question.created_by?.id || question.created_by,
            updated_by: user?.id || null
          };

          const response = await fetch('https://api.chuaphucminh.xyz/api/questions/', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(duplicatedQuestion)
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Nhân đôi câu hỏi thất bại: ${errorText}`);
          }

          const createdQuestion = await response.json();
          const q = {
            ...createdQuestion,
            edited_content: createdQuestion.edited_content || createdQuestion.content,
            showAnswerSection: false,
            newAnswer: '',
            created_by: createdQuestion.created_by || {username: 'Khách', full_name: 'Khách'},
            updated_by: createdQuestion.updated_by || createdQuestion.created_by || {username: 'Khách', full_name: 'Khách'}
          };
          q.search_index = this.buildSearchIndex(q);
          this.questions.unshift(q);
          this.applyFilters();
          setTimeout(() => this.rebuildDuplicateMap(), 0);

          this.showNotificationMessage(`Đã nhân đôi câu hỏi thành "${displayName}"`, 'success');
          
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage(error.message, 'error');
        }
      },



      // Hàm phát hiện câu hỏi trùng lặp
      detectDuplicates: function() {
        // Backward-compatible wrapper: ensure cache exists, then return list form
        if (this.enableDuplicateCheck && !this.isDetectingDuplicates && Object.keys(this.duplicateMap).length === 0) {
          this.rebuildDuplicateMap();
        }

        const duplicates = [];
        for (const q of this.questions) {
          const info = this.duplicateMap[q.id];
          if (info?.hasDuplicate) {
            duplicates.push({ question: q, similar: info.similar || [] });
          }
        }
        return duplicates;
      },

      // Hàm tìm câu hỏi tương tự
      findSimilarQuestions: function(targetQuestion, currentIndex) {
        // Prefer cached results (O(1))
        const cached = this.duplicateMap?.[targetQuestion.id]?.similar;
        if (Array.isArray(cached)) return cached;

        // Fallback to the old calculation (should be rare; main path is rebuildDuplicateMap)
        const similar = [];
        const targetContent = this.normalizeText(targetQuestion.edited_content || targetQuestion.content);
        if (!targetContent || targetContent.length < 5) return similar;

        this.questions.forEach((question, index) => {
          if (index === currentIndex || question.id === targetQuestion.id) return;
          const content = this.normalizeText(question.edited_content || question.content);
          if (!content || content.length < 5) return;
          const similarity = this.calculateSimilarity(targetContent, content);
          if (similarity > this.duplicateSimilarityThreshold) {
            similar.push({ question: question, similarity: similarity });
          }
        });

        return similar.sort((a, b) => b.similarity - a.similarity);
      },

      // Chuẩn hóa văn bản để so sánh
      normalizeText: function(text) {
        if (!text) return '';
        return text
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
          .replace(/[^\w\s]/g, ' ') // Loại bỏ ký tự đặc biệt
          .replace(/\s+/g, ' ') // Chuẩn hóa khoảng trắng
          .trim();
      },

      buildSearchIndex: function(q) {
        const parts = [
          q.name,
          q.display_name,
          q.content,
          q.short_content,
          q.edited_content,
          q.answer,
          q.group,
          q.tags,
          q.contact
        ].filter(Boolean);

        // Use same normalization as duplicate detection (lowercase + remove accents)
        return this.normalizeText(parts.join(' '));
      },

      // Tính độ tương đồng sử dụng Jaccard similarity
      calculateSimilarity: function(text1, text2) {
        const words1 = new Set(text1.split(' ').filter(word => word.length > 2)); // Lọc từ ngắn
        const words2 = new Set(text2.split(' ').filter(word => word.length > 2));
        
        if (words1.size === 0 || words2.size === 0) return 0;
        
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        
        return intersection.size / union.size;
      },

      // Kiểm tra xem câu hỏi có trùng lặp không
      hasDuplicate: function(question) {
        return !!this.duplicateMap?.[question.id]?.hasDuplicate;
      },

      // Hiển thị modal câu hỏi tương tự
      showSimilarQuestions: function(question) {
        this.currentSimilarQuestion = question;
        // Ensure cache exists if enabled; otherwise fallback to direct compute
        if (this.enableDuplicateCheck && Object.keys(this.duplicateMap).length === 0 && !this.isDetectingDuplicates) {
          this.rebuildDuplicateMap();
        }
        this.similarQuestions = this.findSimilarQuestions(question, this.questions.indexOf(question));
        this.showSimilarModal = true;
      },

      // Đếm số câu hỏi có trùng lặp
      getDuplicateCount: function() {
        return this.duplicateCount || 0;
      },

      rebuildDuplicateMap: function() {
        if (!this.enableDuplicateCheck) {
          this.duplicateMap = {};
          this.duplicateCount = 0;
          this.duplicateDisabledReason = '';
          return;
        }

        const n = this.questions.length;
        if (n === 0) {
          this.duplicateMap = {};
          this.duplicateCount = 0;
          this.duplicateDisabledReason = '';
          return;
        }

        if (n > this.maxDuplicateCheck) {
          this.duplicateMap = {};
          this.duplicateCount = 0;
          this.duplicateDisabledReason = `Tạm tắt kiểm tra trùng lặp vì danh sách quá lớn (${n} > ${this.maxDuplicateCheck})`;
          return;
        }

        this.isDetectingDuplicates = true;
        this.duplicateDisabledReason = '';

        const wordSets = new Array(n);
        const ids = new Array(n);

        for (let i = 0; i < n; i++) {
          const q = this.questions[i];
          ids[i] = q.id;
          const normalized = this.normalizeText(q.edited_content || q.content);
          if (!normalized || normalized.length < 5) {
            wordSets[i] = null;
            continue;
          }
          wordSets[i] = new Set(normalized.split(' ').filter(w => w.length > 2));
        }

        const map = {};
        const threshold = this.duplicateSimilarityThreshold;

        const ensureEntry = (id) => {
          if (!map[id]) map[id] = { hasDuplicate: false, similar: [] };
          return map[id];
        };

        const jaccard = (setA, setB) => {
          if (!setA || !setB || setA.size === 0 || setB.size === 0) return 0;
          let small = setA, large = setB;
          if (setA.size > setB.size) {
            small = setB; large = setA;
          }
          let intersection = 0;
          small.forEach(w => { if (large.has(w)) intersection++; });
          const union = setA.size + setB.size - intersection;
          return union === 0 ? 0 : intersection / union;
        };

        for (let i = 0; i < n; i++) {
          const setI = wordSets[i];
          if (!setI) continue;
          for (let j = i + 1; j < n; j++) {
            const setJ = wordSets[j];
            if (!setJ) continue;
            const sim = jaccard(setI, setJ);
            if (sim > threshold) {
              const qi = this.questions[i];
              const qj = this.questions[j];
              const ei = ensureEntry(ids[i]);
              const ej = ensureEntry(ids[j]);
              ei.similar.push({ question: qj, similarity: sim });
              ej.similar.push({ question: qi, similarity: sim });
            }
          }
        }

        let dupCount = 0;
        for (const id of Object.keys(map)) {
          map[id].similar.sort((a, b) => b.similarity - a.similarity);
          map[id].hasDuplicate = map[id].similar.length > 0;
          if (map[id].hasDuplicate) dupCount++;
        }

        this.duplicateMap = map;
        this.duplicateCount = dupCount;
        this.isDetectingDuplicates = false;
      },





     


      quickEditField: async function(question, field, value) {
        const token = localStorage.getItem('access_token');
        const user = JSON.parse(localStorage.getItem('user'));
        const oldValue = question[field];
        
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

        // Skip request if value is unchanged
        const currentValue = (field === 'content') ? question.edited_content : question[field];
        if (currentValue === oldValue) return;

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
          question.search_index = this.buildSearchIndex(question);
          
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
            this.questions[index].search_index = this.buildSearchIndex(this.questions[index]);
          }
          
          // Cập nhật filteredQuestions
          this.applyFilters();
          
          this.showTemporaryNotification('Đã tự động lưu thay đổi');
          
        } catch (error) {
          console.error('Error auto-saving edit modal:', error);
          // Không hiển thị thông báo lỗi để không làm phiền người dùng
        }
      }, 1800), // Debounce tăng để giảm request khi gõ dài

      // init: function() {
      //   if (!localStorage.getItem('access_token')) {
      //     window.location.href = '/login.html?next=' + encodeURIComponent(window.location.pathname);
      //   }
      //   this.fetchQuestions();
      // },
     


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
              updated_by: q.updated_by || q.created_by || {username: 'Khách', full_name: 'Khách'},
              search_index: '' // filled below
            }));

            // Build a single normalized string for fast includes() search
            this.questions.forEach(q => { q.search_index = this.buildSearchIndex(q); });
            
            this.applyFilters();

            // Build duplicate cache once after loading (bounded by maxDuplicateCheck)
            setTimeout(() => {
              this.rebuildDuplicateMap();
            }, 0);
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
            this.questions[index].search_index = this.buildSearchIndex(this.questions[index]);
          }
          
          // Hiển thị thông báo nhỏ không làm phiền người dùng
          this.showTemporaryNotification('Đã tự động lưu thay đổi');
        } catch (error) {
          console.error('Error:', error);
          this.showNotificationMessage('Lỗi khi lưu thay đổi: ' + error.message, 'error');
        }
      }, 1200), // Debounce tăng để giảm request khi gõ dài

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
          const query = this.normalizeText(this.searchQuery);
          results = results.filter(q => (q.search_index || '').includes(query));
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

        // THÊM BỘ LỌC TRÙNG LẶP
        if (this.duplicateFilter === 'has_duplicate') {
          results = results.filter(q => this.hasDuplicate(q));
        } else if (this.duplicateFilter === 'no_duplicate') {
          results = results.filter(q => !this.hasDuplicate(q));
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
        this.showSimilarModal = false; // Thêm dòng này để đóng modal tương tự
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
        .then((createdQuestion) => {
          const q = {
            ...createdQuestion,
            edited_content: createdQuestion.edited_content || createdQuestion.content,
            showAnswerSection: false,
            newAnswer: '',
            created_by: createdQuestion.created_by || {username: 'Khách', full_name: 'Khách'},
            updated_by: createdQuestion.updated_by || createdQuestion.created_by || {username: 'Khách', full_name: 'Khách'}
          };
          q.search_index = this.buildSearchIndex(q);
          this.questions.unshift(q);
          this.applyFilters();
          setTimeout(() => this.rebuildDuplicateMap(), 0);

          this.showNotificationMessage('Thêm câu hỏi mới thành công', 'success');
          this.showQuestionModal = false;
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
        .then((updatedQuestion) => {
          const index = this.questions.findIndex(q => q.id === updatedQuestion.id);
          if (index !== -1) {
            this.questions[index] = { ...this.questions[index], ...updatedQuestion };
            this.questions[index].edited_content = this.questions[index].edited_content || this.questions[index].content;
            this.questions[index].search_index = this.buildSearchIndex(this.questions[index]);
          }
          this.applyFilters();
          setTimeout(() => this.rebuildDuplicateMap(), 0);

          this.showNotificationMessage('Cập nhật câu hỏi thành công', 'success');
          this.showQuestionModal = false;
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


      // deleteQuestion: function() {
      //   const token = localStorage.getItem('access_token');
      //   fetch(`https://api.chuaphucminh.xyz/api/questions/${this.currentQuestion.id}/`, {
      //     method: 'DELETE',
      //     headers: { 'Authorization': `Bearer ${token}` }
      //   })
      //   .then(response => {
      //     if (!response.ok) throw new Error('Xóa câu hỏi thất bại');
      //     this.showNotificationMessage('Xóa câu hỏi thành công', 'success');
      //     this.showConfirmModal = false;
      //     this.showDetailModal = false;
          
      //     // CẬP NHẬT QUAN TRỌNG: Nếu đang ở modal câu hỏi tương tự, cập nhật lại danh sách
      //     if (this.showSimilarModal && this.currentSimilarQuestion) {
      //       // Gọi lại hàm hiển thị câu hỏi tương tự để refresh danh sách
      //       this.showSimilarQuestions(this.currentSimilarQuestion);
      //     }
          
      //     this.fetchQuestions(); // Tải lại toàn bộ danh sách câu hỏi
      //   })
      //   .catch(error => {
      //     console.error('Error:', error);
      //     this.showNotificationMessage(error.message, 'error');
      //   });
      // },


      // Hàm xóa câu hỏi (đã có, nhưng cần đảm bảo xử lý modal tương tự)
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

          const deletedId = this.currentQuestion.id;
          this.questions = this.questions.filter(q => q.id !== deletedId);
          this.applyFilters();
          setTimeout(() => this.rebuildDuplicateMap(), 0);
          
          // Cập nhật: Nếu đang ở modal câu hỏi tương tự, cập nhật lại danh sách
          if (this.showSimilarModal && this.currentSimilarQuestion) {
            // Kiểm tra xem câu hỏi vừa xóa có phải là currentSimilarQuestion không
            if (this.currentQuestion.id === this.currentSimilarQuestion.id) {
              // Nếu xóa chính câu hỏi gốc, đóng modal tương tự
              this.showSimilarModal = false;
            } else {
              // Nếu xóa câu hỏi khác, chỉ refresh danh sách
              this.showSimilarQuestions(this.currentSimilarQuestion);
            }
          }
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