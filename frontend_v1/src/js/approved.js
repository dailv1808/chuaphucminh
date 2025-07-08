function approvedData() {
  return {
    sidebarOpen: window.innerWidth >= 640,
    items: [
      { 
        name: 'Phạm Thị D', 
        dob: '30/03/1992', 
        gender: 'Nữ', 
        registerDate: '15/05/2023', 
        approvedDate: '18/05/2023',
        status: 'Đã duyệt' 
      },
      { 
        name: 'Hoàng Văn E', 
        dob: '05/12/1985', 
        gender: 'Nam', 
        registerDate: '16/05/2023', 
        approvedDate: '19/05/2023',
        status: 'Đã duyệt' 
      }
    ],
    
    init() {
      window.addEventListener('resize', () => {
        this.sidebarOpen = window.innerWidth >= 640;
      });
    },
    
    viewDetails(index) {
      // Xem chi tiết thiền sinh
      alert(`Xem chi tiết: ${this.items[index].name}`);
    },
    
    cancelApproval(index) {
      // Hủy phê duyệt
      if(confirm(`Bạn chắc chắn muốn hủy phê duyệt thiền sinh ${this.items[index].name}?`)) {
        this.items[index].status = 'Đã hủy';
        alert(`Đã hủy phê duyệt: ${this.items[index].name}`);
      }
    }
  }
}
