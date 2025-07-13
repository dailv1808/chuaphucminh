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

// Validate ngày
function validateDates() {
    const today = new Date().toISOString().split('T')[0];
    const startDate = document.getElementById('start_date').value;
    const endDate = document.getElementById('end_date').value;
    
    // Set min date cho các trường ngày
    document.getElementById('start_date').min = today;
    document.getElementById('end_date').min = today;
    
    if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
            alert('Ngày đi phải sau hoặc bằng ngày đến');
            return false;
        }
    }
    return true;
}

// Xử lý form đăng ký
function initForm() {
    const form = document.getElementById('registerForm');
    const submitBtn = document.getElementById('submitBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    
    if (form) {
        // Validate khi thay đổi ngày
        document.getElementById('start_date').addEventListener('change', validateDates);
        document.getElementById('end_date').addEventListener('change', validateDates);
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!validateDates()) return;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'ĐANG XỬ LÝ...';
            
            try {
                // Chuẩn bị dữ liệu gửi đi
                const formData = {
                    username: document.getElementById('phone').value,
                    cccd: document.getElementById('cccd').value,
                    fullname: document.getElementById('fullname').value,
                    gender: document.getElementById('gender').value,
                    birthday: document.getElementById('birthday').value,
                    email: document.getElementById('email').value,
                    address: document.getElementById('address').value,
                    emergency_phone: document.getElementById('emergency_phone').value,
                    note: document.getElementById('note').value,
                    start_date: document.getElementById('start_date').value,
                    end_date: document.getElementById('end_date').value
                };

                // Gọi API đăng ký
                const response = await fetch(getApiUrl('/api/registration/'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken') // Cho Django
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();
                
                if (!response.ok) {
                    const errorMsg = data.detail || data.message || 'Đăng ký thất bại';
                    throw new Error(errorMsg);
                }
                
                // Hiển thị modal thành công
                document.getElementById('successModal').classList.remove('hidden');
                
                // Reset form
                form.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('Có lỗi xảy ra khi đăng ký: ' + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'ĐĂNG KÝ THAM DỰ';
            }
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('successModal').classList.add('hidden');
        });
    }
}

// Hàm lấy CSRF token (cho Django)
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Khởi chạy khi DOM tải xong
document.addEventListener('DOMContentLoaded', loadPartials);
