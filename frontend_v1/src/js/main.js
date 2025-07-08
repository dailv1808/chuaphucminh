document.addEventListener('alpine:init', () => {
  // Tạo store cho sidebar
  Alpine.store('sidebar', {
    open: window.innerWidth >= 640,
    toggle() {
      this.open = !this.open;
    }
  });

  // Data cho ứng dụng chính
  Alpine.data('appData', () => ({
    init() {
      // Cập nhật trạng thái sidebar khi resize
      window.addEventListener('resize', () => {
        Alpine.store('sidebar').open = window.innerWidth >= 640;
      });
    }
  }));
});
