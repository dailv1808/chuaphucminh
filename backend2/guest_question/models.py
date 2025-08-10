from django.db import models
from django.utils import timezone
from accounts.models import Account

class GuestQuestion(models.Model):
    PRIORITY_CHOICES = [
        ('high', 'Cao'),
        ('medium', 'Vừa'),
        ('low', 'Thấp'),
    ]

    STATUS_CHOICES = [
        ('answered', 'Đã trả lời'),
        ('pending', 'Chưa trả lời'),
        ('archive', 'Lưu trữ'),
        ('reject', 'Từ chối'),
        ('review', 'Cần xem xét'),
    ]

    # Thông tin câu hỏi
    name = models.CharField("Tên", max_length=255)
    email = models.EmailField("Email", blank=True, null=True)
    content = models.TextField("Nội dung câu hỏi")
    edited_content = models.TextField("Nội dung câu hỏi đã hiên tập", blank=True, null=True)
    contact = models.CharField("Contact SĐT hoặc email hoặc link fb", max_length=100, blank=True)
    answer = models.TextField("Nội dung câu trả lời", blank=True, null=True)
    short_content = models.CharField("Nội dung rút gọn", max_length=300, blank=True)
    answered_at = models.DateTimeField("Thời điểm trả lời", blank=True, null=True)
    tags = models.CharField("Tags", max_length=255, blank=True, null=True)
    group = models.CharField("Nhóm câu hỏi", max_length=100, blank=True, null=True)
    
    # Trạng thái và hiển thị
    status = models.CharField(
        "Trạng thái", 
        max_length=10, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    priority = models.CharField(
        "Độ ưu tiên", 
        max_length=10, 
        choices=PRIORITY_CHOICES, 
        default='medium'
    )
    slideshow = models.BooleanField("Hiển thị slideshow", default=False)
    is_faq = models.BooleanField(
        "Hiển thị trên trang câu hỏi thường gặp", 
        default=False
    )
    
    # Thông tin thời gian
    created_at = models.DateTimeField("Ngày tạo", auto_now_add=True)
    updated_at = models.DateTimeField("Ngày cập nhật", auto_now=True)
    
    # Thông tin người dùng
    created_by = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        related_name='created_questions',
        verbose_name="Người tạo",
        null=True,
        blank=True
    )
    updated_by = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        related_name='updated_questions',
        verbose_name="Người cập nhật",
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.name} - {self.short_content[:30]}"

    def save(self, *args, **kwargs):
        # Tự động tạo short_content nếu chưa có
        if not self.short_content:
            self.short_content = self.content[:100] + "..."
            
        # Cập nhật answered_at nếu có answer và chưa có answered_at
        if self.answer and not self.answered_at:
            self.answered_at = timezone.now()
            
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Câu hỏi khách"
        verbose_name_plural = "Câu hỏi khách"
        ordering = ['-created_at']