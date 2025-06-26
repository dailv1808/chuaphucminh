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
    pendingList: [],
    isLoading: true,
    errorMessage: '',
    successMessage: '',
    currentPage: 1,
    itemsPerPage: 5,
    
    // Computed properties
    get startItem() {
      return (this.currentPage - 1) * this.itemsPerPage + 1;
    },
    get endItem() {
      return Math.min(this.currentPage * this.itemsPerPage, this.pendingList.length);
    },
    get paginatedItems() {
      return this.pendingList.slice(
        (this.currentPage - 1) * this.itemsPerPage,
        this.currentPage * this.itemsPerPage
      );
    },
    
    // Methods
    async fetchPendingRegistrations() {
      try {
        this.isLoading = true;
        this.errorMessage = '';
        const response = await fetch('http://localhost:8000/api/registration/');
        
        if (!response.ok) {
          throw new Error(`Lỗi khi tải dữ liệu: ${response.status}`);
        }
        
        const data = await response.json();
        this.pendingList = data.map(item => ({
          id: item.id,
          displayId: `#TV-${item.id.toString().padStart(3, '0')}`,
          fullname: item.fullname,
          email: item.email,
          phone_number: item.phone_number,
          cccd: item.cccd,
          gender: item.gender,
          avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.fullname) + '&background=random',
          registerDate: new Date(item.created_at).toLocaleDateString('vi-VN'),
          created_at: item.created_at,
          kuti: 'Chưa xác định',
          status: item.status,
          start_date: item.start_date,
          end_date: item.end_date,
          address: item.address,
          emergency_phone: item.emergency_phone,
          note: item.note
        }));
        
        this.successMessage = 'Tải dữ liệu thành công';
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error fetching pending registrations:', error);
        this.errorMessage = error.message || 'Đã xảy ra lỗi khi tải dữ liệu';
      } finally {
        this.isLoading = false;
      }
    },
    
    async approve(id) {
      try {
        this.errorMessage = '';
        const response = await fetch(`http://localhost:8000/api/registration/${id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'approved' })
        });
        
        if (!response.ok) {
          throw new Error('Không thể phê duyệt đăng ký');
        }
        
        // Update local state
        const item = this.pendingList.find(item => item.id === id);
        if (item) {
          item.status = 'approved';
        }
        
        this.successMessage = 'Đã phê duyệt đăng ký thành công';
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error approving registration:', error);
        this.errorMessage = error.message || 'Đã xảy ra lỗi khi phê duyệt';
      }
    },
    
    async reject(id) {
      try {
        this.errorMessage = '';
        const response = await fetch(`http://localhost:8000/api/registration/${id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'rejected' })
        });
        
        if (!response.ok) {
          throw new Error('Không thể từ chối đăng ký');
        }
        
        // Update local state
        const item = this.pendingList.find(item => item.id === id);
        if (item) {
          item.status = 'rejected';
        }
        
        this.successMessage = 'Đã từ chối đăng ký thành công';
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        console.error('Error rejecting registration:', error);
        this.errorMessage = error.message || 'Đã xảy ra lỗi khi từ chối';
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
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('vi-VN', options);
    },
    
    init() {
      this.fetchPendingRegistrations();
      
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
