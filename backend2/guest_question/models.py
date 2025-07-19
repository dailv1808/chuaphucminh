from django.db import models
from django.utils import timezone

class QuestionGroup(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class QuestionTag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

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

    name = models.CharField("Tên", max_length=255)
    email = models.EmailField("Email", blank=True, null=True)
    content = models.TextField("Nội dung câu hỏi")
    contact = models.CharField("Contact SĐT hoặc email hoặc link fb", max_length=100, blank=True)
    answer = models.TextField("Nội dung câu trả lời", blank=True, null=True)
    short_content = models.CharField("Nội dung rút gọn", max_length=300, blank=True)
    answered_at = models.DateTimeField("Thời điểm trả lời", blank=True, null=True)
    tags = models.ManyToManyField(QuestionTag, blank=True, verbose_name="Tag")
    group = models.ForeignKey(QuestionGroup, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Nhóm câu hỏi")
    status = models.CharField("Trạng thái", max_length=10, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField("Độ ưu tiên", max_length=10, choices=PRIORITY_CHOICES, default='medium')
    slideshow = models.BooleanField("Hiển thị slideshow", default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.short_content[:30]}"

    def save(self, *args, **kwargs):
        if not self.short_content:
            self.short_content = self.content[:100] + "..."
        super().save(*args, **kwargs)

