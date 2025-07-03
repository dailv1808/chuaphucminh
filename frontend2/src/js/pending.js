function pendingData() {
  return {
    sidebarOpen: window.innerWidth >= 640,
    items: [
      { 
        name: 'Nguyễn Văn A', 
        dob: '15/05/1990', 
        gender: 'Nam', 
        registerDate: '20/05/2023', 
        status: 'Chờ duyệt' 
      },
      { 
        name: 'Trần Thị B', 
        dob: '22/08/1995', 
        gender: 'Nữ', 
        registerDate: '21/05/2023', 
        status: 'Chờ duyệt' 
      },
      { 
        name: 'Lê Văn C', 
        dob: '10/11/1988', 
        gender: 'Nam', 
        registerDate: '22/05/2023', 
        status: 'Chờ duyệt' 
      }
    ],
    
    init() {
      window.addEventListener('resize', () => {
        this.sidebarOpen = window.innerWidth >= 640;
      });
    },
    
    approveItem(index) {
      this.items[index].status = 'Đã duyệt';
      // Gọi API hoặc xử lý logic duyệt ở đây
      alert(`Đã duyệt thiền sinh: ${this.items[index].name}`);
    },
    
    rejectItem(index) {
      this.items[index].status = 'Từ chối';
      // Gọi API hoặc xử lý logic từ chối ở đây
      alert(`Đã từ chối thiền sinh: ${this.items[index].name}`);
    }
  }
}
