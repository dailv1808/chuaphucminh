document.addEventListener('alpine:init', () => {
  // Main app data
  Alpine.data('app', () => ({
    // Sidebar state
    sidebarOpen: window.innerWidth >= 768,
    sidebarLocked: localStorage.getItem('sidebarLocked') === 'true',
    isHovered: false,
    accountMenuOpen: false,
    meditationMenuOpen: true, // Mở submenu quản lý thiền sinh mặc định
    
    // Page title
    pageTitle: 'Chờ phê duyệt',
    
    // Table data
    pendingList: [
      {
        id: '#TV-001',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        registerDate: '15/05/2023',
        kuti: 'Kuti 1',
        status: 'pending'
      },
      {
        id: '#TV-002',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        registerDate: '16/05/2023',
        kuti: 'Kuti 3',
        status: 'pending'
      },
      {
        id: '#TV-003',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        registerDate: '17/05/2023',
        kuti: 'Kuti 2',
        status: 'pending'
      },
      {
        id: '#TV-004',
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
        registerDate: '18/05/2023',
        kuti: 'Kuti 4',
        status: 'pending'
      },
      {
        id: '#TV-005',
        name: 'Hoàng Văn E',
        email: 'hoangvane@example.com',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        registerDate: '19/05/2023',
        kuti: 'Kuti 1',
        status: 'pending'
      }
    ],
    currentPage: 1,
    itemsPerPage: 5,
    
    // Computed properties
    get startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    get endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.pendingList.length);
    },
    
    // Methods
    approve(id) {
      const index = this.pendingList.findIndex(item => item.id === id);
      if (index !== -1) {
        this.pendingList[index].status = 'approved';
      }
    },
    
    reject(id) {
      const index = this.pendingList.findIndex(item => item.id === id);
      if (index !== -1) {
        this.pendingList[index].status = 'rejected';
      }
    },
    
    nextPage() {
      if (this.currentPage * this.itemsPerPage < this.pendingList.length) {
        this.currentPage++;
      }
    },
    
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    
    init() {
      // Xử lý responsive khi resize
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && this.sidebarLocked) {
          this.sidebarOpen = true;
        }
      });
    }
  }));

  // Directive cho tooltip
  Alpine.directive('tooltip', (el, { expression }, { evaluateLater, effect }) => {
    let getContent = evaluateLater(expression);
    let content = '';
    
    effect(() => {
      getContent(value => {
        content = value;
      });
    });
    
    const showTooltip = (e) => {
      if (!content) return;
      
      const rect = el.getBoundingClientRect();
      const x = rect.left + (rect.width / 2);
      const y = rect.top;
      
      window.dispatchEvent(new CustomEvent('tooltip', {
        detail: {
          content,
          show: true,
          x,
          y
        }
      }));
    };
    
    const hideTooltip = () => {
      window.dispatchEvent(new CustomEvent('tooltip', {
        detail: {
          content: '',
          show: false,
          x: 0,
          y: 0
        }
      }));
    };
    
    el.addEventListener('mouseenter', showTooltip);
    el.addEventListener('mouseleave', hideTooltip);
    
    return () => {
      el.removeEventListener('mouseenter', showTooltip);
      el.removeEventListener('mouseleave', hideTooltip);
    };
  });
});
