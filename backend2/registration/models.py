from django.db import models
class Registration(models.Model):    
    # phone_number = models.ForeignKey(Account, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=12, unique=True)
    cccd = models.CharField(max_length=12, unique=True)
    fullname = models.CharField(max_length=128)
    GENDER_CHOICES = [('Nam', 'Nam'), ('Nữ', 'Nữ')]
    gender = models.CharField(max_length=5, choices=GENDER_CHOICES)
    birthday = models.DateField(null=True, blank=True)
    email = models.CharField(max_length=40, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    emergency_phone = models.CharField(max_length=15, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('approved', 'approved'),
        ('rejected', 'rejected'),
        ('checked_in', 'checked_in'),
        ('checked_out', 'checked_out'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    start_date = models.DateField()
    end_date = models.DateField()
    class Meta:
        indexes = [models.Index(fields=['phone_number'], name='idx_phone_number')]

    def __str__(self):
        return f"{self.fullname} ({self.phone_number})"
