// src/js/auth.js

// Kiểm tra đăng nhập khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
  const publicPages = ['/login.html']; // Danh sách trang không cần đăng nhập
  const currentPage = window.location.pathname.split('/').pop(); // Lấy tên trang hiện tại
  
  // Nếu không phải trang public và không có token
  if (!publicPages.includes(`/${currentPage}`) && !localStorage.getItem('access_token')) {
    window.location.href = '/login.html'; // Chuyển hướng đến trang login
  }
});
