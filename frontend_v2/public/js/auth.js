// Kiểm tra đăng nhập ngay khi script được load
(function() {
  const html = document.documentElement;
  // Ẩn giao diện trong lúc kiểm tra auth để tránh lộ layout admin
  html.classList.add('auth-guard-loading');

  const publicPages = ['/login.html']; // Danh sách trang không cần đăng nhập
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop(); // Lấy tên trang hiện tại (vd: qa.html)

  // Bỏ qua các trang public (vd: trang login)
  if (publicPages.includes(`/${currentPage}`)) {
    html.classList.remove('auth-guard-loading');
    html.classList.add('auth-guard-ok');
    return;
  }

  const token = localStorage.getItem('access_token');

  // Nếu không có token thì redirect ngay, hạn chế để lộ giao diện admin
  if (!token) {
    const next = currentPath + window.location.search + window.location.hash;
    window.location.replace('/login.html?next=' + encodeURIComponent(next));
    return;
  }

  // Có token hợp lệ → cho phép hiển thị giao diện
  html.classList.remove('auth-guard-loading');
  html.classList.add('auth-guard-ok');
})();
