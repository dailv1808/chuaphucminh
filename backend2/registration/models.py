from django.db import models

class Registration(models.Model):    
    # username = models.ForeignKey(Account, on_delete=models.CASCADE)
    username  = models.CharField(max_length=12)
    cccd = models.CharField(max_length=12)
    fullname = models.CharField(max_length=128)
    GENDER_CHOICES = [('Nam', 'Nam'), ('Nữ', 'Nữ')]
    gender = models.CharField(max_length=5, choices=GENDER_CHOICES)
    birthday = models.DateField(null=True, blank=True)
    email = models.CharField(max_length=40, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    emergency_phone = models.CharField(max_length=15, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    reject_reason = models.TextField(null=True, blank=True)

    ## Add them
    kuti_assigned = models.BooleanField(default=False)     #  các đăng ký chưa được gán kuti.
    duration = models.IntegerField(null=True, blank=True)  # lưu số ngày hành thiền, có thể tính tự động từ start_date và end_date.


    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('approved', 'approved'),
        ('rejected', 'rejected'),
        ('checked_in', 'checked_in'),
        ('checked_out', 'checked_out'),
        ('expired', 'expired'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    start_date = models.DateField()
    end_date = models.DateField()
    class Meta:
        indexes = [models.Index(fields=['username'], name='username')]

    def __str__(self):
        return f"{self.fullname} - ({self.username }) -  {self.start_date} to {self.end_date}"
