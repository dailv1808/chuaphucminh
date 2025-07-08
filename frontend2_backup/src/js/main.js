// src/js/main.js
document.addEventListener('alpine:init', () => {
  Alpine.store('sidebar', {
    open: window.innerWidth >= 640,
    toggle() {
      this.open = !this.open;
    }
  });

  Alpine.data('appData', () => ({
    init() {
      window.addEventListener('resize', () => {
        Alpine.store('sidebar').open = window.innerWidth >= 640;
      });
    }
  }));
});
