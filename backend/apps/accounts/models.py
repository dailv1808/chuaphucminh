from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.contrib.auth.models import AbstractUser

class UserManager(BaseUserManager):
    def create_user(self, phone, password=None, **extra_fields):
        if not phone:
            raise ValueError('The Phone field must be set')
        user = self.model(phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(phone, password, **extra_fields)


class User(AbstractUser):
    phone = models.CharField(max_length=20, unique=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    

    USERNAME_FIELD = 'phone'
    REQUIRED_FIELDS = []

    class Meta:
        indexes = [models.Index(fields=['phone'], name='idx_user_phone')]

class UserDetail(models.Model):
    GENDER_CHOICES = [('Nam', 'Nam'), ('Nữ', 'Nữ')]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    cccd = models.CharField(max_length=12, unique=True)
    fullname = models.CharField(max_length=128)
    gender = models.CharField(max_length=5, choices=GENDER_CHOICES)
    birthday = models.DateField(null=True, blank=True)
    email = models.CharField(max_length=40, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    emergency_phone = models.CharField(max_length=15, null=True, blank=True)
    note = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=['user'], name='idx_user_detail_user')]
