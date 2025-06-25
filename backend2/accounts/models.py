from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
class MyAccountManager(BaseUserManager):
    def create_user(self, full_name, phone_number, email, password=None):
        if not email:
            raise ValueError('Email address is required')

        if not phone_number:
            raise ValueError('phone_number is required')

        # Tạo đối tượng user mới
        user = self.model(
            email=self.normalize_email(email=email),    # Chuyển email về dạng bình thường
            phone_number=phone_number,
            full_name=full_name,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, full_name, email, phone_number, password):
        user = self.create_user(
            email=self.normalize_email(email=email),
            phone_number=phone_number,
            password=password,
            full_name=full_name,
        )
        user.is_admin = True
        user.is_active = True
        user.is_staff = True
        user.is_superadmin = True
        user.save(using=self._db)
        return user
class Account(AbstractBaseUser):
    full_name = models.CharField(max_length=50)
    email = models.EmailField(max_length=100, unique=True)
    phone_number = models.CharField(max_length=50, unique=True)

    # required
    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now_add=True)
    is_admin = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    is_superadmin = models.BooleanField(default=False)

    USERNAME_FIELD = 'phone_number'    # Trường quyêt định khi login
    REQUIRED_FIELDS = ['email', 'full_name']    # Các trường yêu cầu khi đk tài khoản (mặc định đã có email), mặc định có password

    objects = MyAccountManager()

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_admin    # Admin có tất cả quyền trong hệ thống

    def has_module_perms(self, add_label):
        return True
