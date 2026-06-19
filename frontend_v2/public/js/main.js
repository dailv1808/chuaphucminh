document.addEventListener('alpine:init', () => {
  const sidebarStore = {
    open: false,
    pinned: false,

    init() {
      this.pinned = localStorage.getItem('sidebar_pinned') === '1';
      this.open = this.pinned || localStorage.getItem('sidebar_open') === '1';
      window.addEventListener('resize', () => {
        if (window.innerWidth < 1024 && this.pinned) {
          this.pinned = false;
          this.open = false;
          this.persist();
        }
      });
    },

    persist() {
      localStorage.setItem('sidebar_open', this.open ? '1' : '0');
      localStorage.setItem('sidebar_pinned', this.pinned ? '1' : '0');
    },

    toggle() {
      if (this.pinned) return;
      this.open = !this.open;
      this.persist();
    },

    openSidebar() {
      this.open = true;
      this.persist();
    },

    close() {
      if (this.pinned) return;
      this.open = false;
      this.persist();
    },

    togglePinned() {
      this.pinned = !this.pinned;
      if (this.pinned) {
        this.open = true;
      }
      this.persist();
    }
  };

  Alpine.store('sidebar', sidebarStore);
  sidebarStore.init();

  Alpine.data('sidebar', () => ({}));
});
