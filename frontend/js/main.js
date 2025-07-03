// Khởi tạo AlpineJS
document.addEventListener('alpine:init', () => {
    Alpine.data('main', () => ({
        sidebarOpen: window.innerWidth > 1024,
        isDarkMode: false,
        sidebarMini: false,
        notificationsOpen: false,
        profileOpen: false,

        init() {
            // Kiểm tra dark mode từ localStorage
            this.isDarkMode = localStorage.getItem('darkMode') === 'true';
            this.applyDarkMode();
            
            // Kiểm tra sidebar mini từ localStorage
            this.sidebarMini = localStorage.getItem('sidebarMini') === 'true';
            
            // Xử lý responsive sidebar
            this.handleResize();
            window.addEventListener('resize', this.handleResize.bind(this));
        },

        handleResize() {
            if (window.innerWidth <= 1024) {
                this.sidebarOpen = false;
            } else {
                this.sidebarOpen = true;
            }
        },

        toggleDarkMode() {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem('darkMode', this.isDarkMode);
            this.applyDarkMode();
        },

        applyDarkMode() {
            if (this.isDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },

        toggleSidebarMini() {
            this.sidebarMini = !this.sidebarMini;
            localStorage.setItem('sidebarMini', this.sidebarMini);
        },

        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },

        toggleNotifications() {
            this.notificationsOpen = !this.notificationsOpen;
            if (this.notificationsOpen) {
                this.profileOpen = false;
            }
        },

        toggleProfile() {
            this.profileOpen = !this.profileOpen;
            if (this.profileOpen) {
                this.notificationsOpen = false;
            }
        },

        closeAllDropdowns() {
            this.notificationsOpen = false;
            this.profileOpen = false;
        }
    }));
});
