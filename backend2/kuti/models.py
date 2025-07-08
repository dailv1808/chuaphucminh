from django.db import models

class Kuti(models.Model):
    code = models.CharField(max_length=20, unique=True)
    GENDER_ALLOWED_CHOICES = [('Nam', 'Nam'), ('Nữ', 'Nữ'), ('All', 'All')]
    gender_allowed = models.CharField(max_length=10, choices=GENDER_ALLOWED_CHOICES)
    is_available = models.BooleanField(default=True)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.code} {self.gender_allowed}"
