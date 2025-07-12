document.addEventListener('alpine:init', () => {
    Alpine.data('formData', () => ({
        name: '',
        question: '',
        contact: '',
        isSubmitting: false,
        mobileMenuOpen: false,
        
        submitForm() {
            this.isSubmitting = true;
            
            // Simulate form submission
            setTimeout(() => {
                alert('Câu hỏi của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm nhất.');
                this.name = '';
                this.question = '';
                this.contact = '';
                this.isSubmitting = false;
            }, 1500);
        },
        
        toggleMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        }
    }));
});

// Include partials
document.addEventListener('DOMContentLoaded', function() {
    const includes = document.querySelectorAll('[data-include]');
    
    includes.forEach(include => {
        const file = include.getAttribute('data-include');
        fetch(file)
            .then(response => response.text())
            .then(data => {
                include.innerHTML = data;
            });
    });
});
