// main.js
import Alpine from 'alpinejs'
window.Alpine = Alpine
Alpine.start()

// ✅ Gắn toàn bộ AlpineJS (từ alpine.js gốc)
document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
    sidebarOpen: window.innerWidth >= 768,
    sidebarLocked: localStorage.getItem('sidebarLocked') === 'true',
    isHovered: false,
    accountMenuOpen: false,
    meditationMenuOpen: true,
    pageTitle: 'Chờ phê duyệt',

    pendingList: [],
    isLoading: true,
    errorMessage: '',
    successMessage: '',
    currentPage: 1,
    itemsPerPage: 5,

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

    async fetchPendingRegistrations() {
      try {
        this.isLoading = true;
        this.errorMessage = '';
        const response = await fetch('http://192.168.0.200:8000/api/registration/');
        if (!response.ok) throw new Error(`Lỗi khi tải dữ liệu: ${response.status}`);
        const data = await response.json();
        this.pendingList = data.map(item => ({
          id: item.id,
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
        this.errorMessage = error.message || 'Đã xảy ra lỗi khi tải dữ liệu';
      } finally {
        this.isLoading = false;
      }
    },

    async approve(id) {
      try {
        this.errorMessage = '';
        const response = await fetch(`http://192.168.0.200:8000/api/registration/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' })
        });
        if (!response.ok) throw new Error('Không thể phê duyệt đăng ký');
        const item = this.pendingList.find(i => i.id === id);
        if (item) item.status = 'approved';
        this.successMessage = 'Đã phê duyệt đăng ký thành công';
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
        this.errorMessage = error.message || 'Đã xảy ra lỗi khi phê duyệt';
      }
    },

    async reject(id) {
      try {
        this.errorMessage = '';
        const response = await fetch(`http://192.168.0.200:8000/api/registration/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' })
        });
        if (!response.ok) throw new Error('Không thể từ chối đăng ký');
        const item = this.pendingList.find(i => i.id === id);
        if (item) item.status = 'rejected';
        this.successMessage = 'Đã từ chối đăng ký thành công';
        setTimeout(() => this.successMessage = '', 3000);
      } catch (error) {
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
      window.addEventListener('resize', () => {
        if (window.innerWidth >= 768 && this.sidebarLocked) {
          this.sidebarOpen = true;
        }
      });
    }
  }));

  // Tooltip
  Alpine.data('tooltip', () => ({
    content: '',
    show: false,
    x: 0,
    y: 0,
    init() {
      window.addEventListener('tooltip', (e) => {
        this.content = e.detail.content;
        this.show = e.detail.show;
        this.x = e.detail.x;
        this.y = e.detail.y;
      });
    }
  }));
});

// Tự khởi động Alpine
// window.Alpine = Alpine;
//Alpine.start();

