// Khởi tạo Alpine store
document.addEventListener('alpine:init', () => {
  Alpine.store('sidebar', {
    open: window.innerWidth >= 1024,
    toggle() {
      this.open = !this.open;
    }
  });
});

// Định nghĩa user dropdown component
document.addEventListener('alpine:init', () => {
  Alpine.data('userDropdown', () => ({
    dropdownOpen: false,
    user: null,
    isLoading: true,
    error: null,
    
    init() {
      this.loadUser();
      // Cập nhật sidebar khi resize
      window.addEventListener('resize', () => {
        Alpine.store('sidebar').open = window.innerWidth >= 1024;
      });
    },
    
    async loadUser() {
      this.error = null;
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('No token found in localStorage');
          this.isLoading = false;
          return;
        }

        const response = await fetch('http://192.168.0.200/api/accounts/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          this.error = `API Error: ${response.status} - ${errorData?.detail || 'Unknown error'}`;
          return;
        }

        const data = await response.json();
        if (data.status !== 'success') {
          this.error = `Data format error: ${data.message || 'Invalid response format'}`;
          return;
        }

        this.user = data.data;
      } catch (error) {
        this.error = `Network error: ${error.message}`;
      } finally {
        this.isLoading = false;
      }
    },
    
    getInitials() {
      if (!this.user) return 'AD';
      const name = this.user.full_name || this.user.username;
      return name.split(' ')
        .filter(part => part.length > 0)
        .map(part => part[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    },
    
    async logout() {
      this.error = null;
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          await fetch('http://192.168.0.200/api/accounts/logout/', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        }
      } catch (error) {
        this.error = `Logout error: ${error.message}`;
      } finally {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login.html';
      }
    }
  }));
});
