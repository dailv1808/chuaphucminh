import { getApiUrl } from './config.js';
// Hàm load partials
async function loadPartials() {
    try {
        // Load header
        const headerResponse = await fetch('partials/header.html');
        document.getElementById('header-container').innerHTML = await headerResponse.text();
        
        // Load footer
        const footerResponse = await fetch('partials/footer.html');
        document.getElementById('footer-container').innerHTML = await footerResponse.text();
        
        // Khởi tạo menu mobile sau khi load xong
        initMobileMenu();
        
        // Khởi tạo form sau khi load xong
        initForm();
    } catch (error) {
        console.error('Lỗi khi tải partials:', error);
    }
}

// Xử lý menu mobile
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

// Xử lý form
function initForm() {
    const form = document.getElementById('questionForm');
    const submitBtn = document.getElementById('submitBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const question = document.getElementById('question').value;
            const contact = document.getElementById('contact').value;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Đang gửi...';
            
            try {
                const response = await fetch(getApiUrl('/api/questions/'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        content: question,
                        contact: contact,
                    })
                });

                if (!response.ok) throw new Error('Gửi câu hỏi thất bại');
                
                // Hiển thị modal thành công
                document.getElementById('successModal').classList.remove('hidden');
                
                // Reset form
                form.reset();
            } catch (error) {
                alert('Có lỗi xảy ra khi gửi câu hỏi: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Gửi trình pháp';
            }
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('successModal').classList.add('hidden');
        });
    }
}

// Khởi chạy khi DOM tải xong
document.addEventListener('DOMContentLoaded', loadPartials);
