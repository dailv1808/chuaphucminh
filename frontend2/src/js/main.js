document.addEventListener('alpine:init', () => {
  Alpine.data('appData', () => ({
    sidebarOpen: window.innerWidth >= 640,
    
    init() {
      window.addEventListener('resize', () => {
        this.sidebarOpen = window.innerWidth >= 640;
      });
    }
  }));
});
