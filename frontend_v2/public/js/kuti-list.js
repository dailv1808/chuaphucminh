document.addEventListener('alpine:init', () => {
  Alpine.data('kutiData', () => ({
    kutis: [],
    showKutiModal: false,
    showConfirmModal: false,
    isEditing: false,
    currentKuti: {
      id: null,
      code: '',
      gender_allowed: 'All',
      is_available: true,
      note: ''
    },
    isLoading: true,
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',

    init() {
      this.fetchKutis();
    },

    async fetchKutis() {
      try {
        this.isLoading = true;


	const token = localStorage.getItem('access_token');
	
       const response = await fetch('http://192.168.0.200:8000/api/kuti/', {
	  headers: {
	    'Authorization': `Bearer ${token}`,
	    'Content-Type': 'application/json'
	  }
        });
        
        if (!response.ok) throw new Error('Lỗi khi tải danh sách Kuti');
        
        this.kutis = await response.json();
      } catch (error) {
        console.error('Error:', error);
        this.showNotificationMessage(error.message, 'error');
      } finally {
        this.isLoading = false;
      }
    },

    openAddKutiModal() {
      this.isEditing = false;
      this.currentKuti = {
        id: null,
        code: '',
        gender_allowed: 'All',
        is_available: true,
        note: ''
      };
      this.showKutiModal = true;
    },

    openEditKutiModal(kuti) {
      this.isEditing = true;
      this.currentKuti = { ...kuti };
      this.showKutiModal = true;
    },

    closeKutiModal() {
      this.showKutiModal = false;
    },

    validateKutiForm() {
      if (!this.currentKuti.code.trim()) {
        this.showNotificationMessage('Vui lòng nhập mã Kuti', 'error');
        return false;
      }
      return true;
    },

    async saveKuti() {
      if (!this.validateKutiForm()) return;

      try {
        const url = this.isEditing 
          ? `http://192.168.0.200:8000/api/kuti/${this.currentKuti.id}/`
          : 'http://192.168.0.200:8000/api/kuti/';
        
        const method = this.isEditing ? 'PUT' : 'POST';


        const token = localStorage.getItem('access_token');
        const response = await fetch(url, {
          method: method,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.currentKuti)
        });
        

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || (this.isEditing ? 'Cập nhật thất bại' : 'Thêm mới thất bại'));
        }
        
        this.showNotificationMessage(
          this.isEditing ? 'Cập nhật Kuti thành công' : 'Thêm Kuti mới thành công', 
          'success'
        );
        
        this.showKutiModal = false;
        await this.fetchKutis();
      } catch (error) {
        console.error('Error:', error);
        this.showNotificationMessage(error.message, 'error');
      }
    },

    confirmDelete(kuti) {
      this.currentKuti = { ...kuti };
      this.showConfirmModal = true;
    },

    async deleteKuti() {
      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`http://192.168.0.200:8000/api/kuti/${this.currentKuti.id}/`, {
	  headers: {
	    'Authorization': `Bearer ${token}`,
          },
          method: 'DELETE'
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Xóa Kuti thất bại');
        }
        
        this.showNotificationMessage('Xóa Kuti thành công', 'success');
        this.showConfirmModal = false;
        await this.fetchKutis();
      } catch (error) {
        console.error('Error:', error);
        this.showNotificationMessage(error.message, 'error');
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    },

    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    }
  }));
});
