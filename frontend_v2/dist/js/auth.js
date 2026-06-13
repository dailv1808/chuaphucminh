// Kiểm tra đăng nhập ngay khi script được load
(function() {
  const publicPages = ['/login.html']; // Danh sách trang không cần đăng nhập
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop(); // Lấy tên trang hiện tại (vd: qa.html)

  // Bỏ qua các trang public (vd: trang login)
  if (publicPages.includes(`/${currentPage}`)) {
    return;
  }

  const token = localStorage.getItem('access_token');

  // Nếu không có token thì redirect ngay, hạn chế để lộ giao diện admin
  if (!token) {
    const next = currentPath + window.location.search + window.location.hash;
    window.location.replace('/login.html?next=' + encodeURIComponent(next));
  }
})();
