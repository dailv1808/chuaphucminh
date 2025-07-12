from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    AccountSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)
from .models import Account
import random
import string
from datetime import timedelta
from rest_framework_simplejwt.authentication import JWTAuthentication

class RegisterView(generics.CreateAPIView):
    queryset = Account.objects.all()
    serializer_class = RegisterSerializer
    #permission_classes = [permissions.IsAdminUser]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Gửi email kích hoạt (nếu cần)
        # self.send_activation_email(user)
        
        return Response({
            "user": AccountSerializer(user, context=self.get_serializer_context()).data,
            "message": "User registered successfully. Please check your email for activation."
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            user = Account.objects.get(username=request.data.get('username'))
            serializer = AccountSerializer(user)
            response.data['user'] = serializer.data
            
        return response


class AccountProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint cho phép user xem và cập nhật thông tin cá nhân
    """
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    http_method_names = ['get', 'put', 'patch']  # Giới hạn các phương thức cho phép

    def get_object(self):
        """
        Lấy thông tin user đang đăng nhập
        """
        try:
            return self.request.user
        except Exception as e:
            # Ghi log lỗi nếu cần
            return Response(
                {"detail": "Không thể lấy thông tin người dùng."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def retrieve(self, request, *args, **kwargs):
        """
        Tùy chỉnh response khi lấy thông tin profile
        """
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response({
                'status': 'success',
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        """
        Tùy chỉnh quá trình cập nhật thông tin
        """
        try:
            instance = self.get_object()
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

            if getattr(instance, '_prefetched_objects_cache', None):
                instance._prefetched_objects_cache = {}

            return Response({
                'status': 'success',
                'data': serializer.data,
                'message': 'Cập nhật thông tin thành công'
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    #permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            # Trong thực tế, bạn có thể thêm token vào blacklist ở đây
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetRequestView(generics.GenericAPIView):
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        user = Account.objects.get(email=email)
        
        # Tạo token reset password
        token_generator = PasswordResetTokenGenerator()
        token = token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Lưu token vào database (nếu cần)
        user.reset_password_token = token
        user.reset_password_token_expire = timezone.now() + timedelta(hours=1)
        user.save()
        
        # Gửi email reset password
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
        
        send_mail(
            'Password Reset Request',
            f'Please click the following link to reset your password: {reset_url}',
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        
        return Response({
            "message": "Password reset link has been sent to your email."
        }, status=status.HTTP_200_OK)

class PasswordResetConfirmView(generics.GenericAPIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uid = force_str(urlsafe_base64_decode(serializer.validated_data['uidb64']))
        user = Account.objects.get(pk=uid)
        
        # Đặt lại mật khẩu
        user.set_password(serializer.validated_data['new_password'])
        user.reset_password_token = None
        user.reset_password_token_expire = None
        user.save()
        
        return Response({
            "message": "Password has been reset successfully."
        }, status=status.HTTP_200_OK)

class UserListView(generics.ListAPIView):
    serializer_class = AccountSerializer
    #permission_classes = [permissions.IsAdminUser]  # Chỉ admin mới có quyền truy cập
    
    def get_queryset(self):
        return Account.objects.all().order_by('-date_joined')
