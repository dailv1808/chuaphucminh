// Khởi tạo tooltip global
document.addEventListener('DOMContentLoaded', () => {
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
  
  // Thêm component tooltip vào DOM
  const tooltipDiv = document.createElement('div');
  tooltipDiv.setAttribute('x-data', 'tooltip');
  tooltipDiv.innerHTML = `
    <div x-show="show" 
         class="fixed z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded whitespace-nowrap"
         :style="\`left: \${x + 10}px; top: \${y + 10}px\`"
         x-transition>
      <span x-text="content"></span>
    </div>
  `;
  document.body.appendChild(tooltipDiv);
});
