document.addEventListener('alpine:init', () => {
    Alpine.data('pending', () => ({
        init() {
            // Khởi tạo các chức năng riêng cho trang pending
            console.log('Pending page initialized');
        },
        
        // Thêm các hàm xử lý riêng cho trang pending
        approveItem(id) {
            console.log(`Approving item ${id}`);
            // Xử lý phê duyệt
        },
        
        rejectItem(id) {
            console.log(`Rejecting item ${id}`);
            // Xử lý từ chối
        }
    }));
});
