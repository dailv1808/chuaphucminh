document.addEventListener('alpine:init', () => {
  Alpine.data('usersData', () => ({
    users: [],
    filteredUsers: [],
    searchQuery: '',
    showUserModal: false,
    showDeleteModal: false,
    selectedUser: null,
    isLoading: true,
    showNotification: false,
    notificationMessage: '',
    notificationType: 'success',
    userForm: {
      username: '',
      full_name: '',
      email: '',
      phone_number: '',
      password: '',
      password2: '',
      is_admin: false,
      is_active: true
    },

    init() {
      this.fetchUsers();
    },

    async fetchUsers() {
      try {
        this.isLoading = true;
        const token = localStorage.getItem('access_token');

        const response = await fetch('https://api.chuaphucminh.xyz/api/accounts/users/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        this.users = data;
        this.filteredUsers = [...this.users];
      } catch (error) {
        console.error('Error fetching users:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi tải dữ liệu người dùng', 'error');
      } finally {
        this.isLoading = false;
      }
    },

    filterUsers() {
      if (!this.searchQuery) {
        this.filteredUsers = [...this.users];
        return;
      }
      
      const query = this.searchQuery.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.full_name && user.full_name.toLowerCase().includes(query)) ||
        (user.email && user.email.toLowerCase().includes(query)) ||
        (user.phone_number && user.phone_number.includes(query))
      );
    },

    showNotificationMessage(message, type = 'success') {
      this.notificationMessage = message;
      this.notificationType = type;
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
      }, 3000);
    },

    openAddUserModal() {
      this.selectedUser = null;
      this.resetUserForm();
      this.showUserModal = true;
    },

    openEditUserModal(user) {
      this.selectedUser = user;
      this.userForm = {
        username: user.username,
        full_name: user.full_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        password: '',
        password2: '',
        is_admin: user.is_admin || false,
        is_active: user.is_active || true
      };
      this.showUserModal = true;
    },

    closeUserModal() {
      this.showUserModal = false;
      this.resetUserForm();
    },

    resetUserForm() {
      this.userForm = {
        username: '',
        full_name: '',
        email: '',
        phone_number: '',
        password: '',
        password2: '',
        is_admin: false,
        is_active: true
      };
    },

    confirmDelete(user) {
      this.selectedUser = user;
      this.showDeleteModal = true;
    },

    async saveUser() {
      try {
        const token = localStorage.getItem('access_token');
        let response;
        
        if (this.selectedUser) {
          // Update existing user
          const url = `https://api.chuaphucminh.xyz/api/accounts/profile/`;
          response = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: this.userForm.username,
              full_name: this.userForm.full_name,
              email: this.userForm.email,
              phone_number: this.userForm.phone_number,
              is_admin: this.userForm.is_admin,
              is_active: this.userForm.is_active
            })
          });
        } else {
          // Create new user
          if (this.userForm.password !== this.userForm.password2) {
            throw new Error('Mật khẩu không khớp');
          }
          
          const url = 'https://api.chuaphucminh.xyz/api/accounts/register/';
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              username: this.userForm.username,
              full_name: this.userForm.full_name,
              email: this.userForm.email,
              phone_number: this.userForm.phone_number,
              password: this.userForm.password,
              is_admin: this.userForm.is_admin,
              is_active: this.userForm.is_active
            })
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Có lỗi xảy ra');
        }

        this.showNotificationMessage(
          this.selectedUser ? 'Cập nhật người dùng thành công' : 'Thêm người dùng mới thành công', 
          'success'
        );
        this.fetchUsers();
        this.closeUserModal();
      } catch (error) {
        console.error('Error saving user:', error);
        this.showNotificationMessage(error.message || 'Có lỗi xảy ra khi lưu người dùng', 'error');
      }
    },

    async deleteUser() {
      try {
        const token = localStorage.getItem('access_token');
        const url = `https://api.chuaphucminh.xyz/api/accounts/profile/`;
        
        const response = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.selectedUser.username,
            is_active: false
          })
        });

        if (!response.ok) throw new Error('Xóa người dùng không thành công');

        this.showNotificationMessage('Đã vô hiệu hóa người dùng thành công', 'success');
        this.fetchUsers();
        this.showDeleteModal = false;
      } catch (error) {
        console.error('Error deleting user:', error);
        this.showNotificationMessage('Có lỗi xảy ra khi xóa người dùng', 'error');
      }
    }
  }));
});
