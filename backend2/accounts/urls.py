from django.urls import path
from .views import (
    RegisterView,
    CustomTokenObtainPairView,
    AccountProfileView,
    LogoutView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserListView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('profile/', AccountProfileView.as_view(), name='profile'),
    path('password-reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('users/', UserListView.as_view(), name='user_list'),
]
