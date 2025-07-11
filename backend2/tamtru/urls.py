# app_name/urls.py
from django.urls import path
from . import views  # Import views từ app hiện tại

urlpatterns = [
    path('', views.generate_tam_tru, name='generate_tam_tru'),
    # Thêm các URL khác của app tại đây
]
