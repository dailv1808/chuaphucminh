document.addEventListener('alpine:init', () => {
  Alpine.data('loginForm', () => ({
    form: {
      username: '',
      password: '',
      remember: false
    },
    loading: false,
    error: null,
    
    async handleLogin() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`http://192.168.0.200:8000/api/accounts/login/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: this.form.username,
            password: this.form.password
          })
        });

        // Kiểm tra response có body không
        const text = await response.text();
        let data = {};
        
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error('Failed to parse JSON:', e);
          throw new Error('Invalid server response');
        }

        if (!response.ok) {
          throw new Error(data.detail || data.message || 'Đăng nhập thất bại');
        }
        
        // Kiểm tra dữ liệu trả về
        if (!data.access || !data.refresh) {
          throw new Error('Thiếu token trong response');
        }
        
        // Lưu token và user info
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // Chuyển hướng
        const redirectTo = new URLSearchParams(window.location.search).get('next') || '/index.html';
        window.location.href = redirectTo;
        
      } catch (err) {
        this.error = err.message || 'Lỗi khi đăng nhập';
        console.error('Login error:', err);
      } finally {
        this.loading = false;
      }
    }
  }));
});

