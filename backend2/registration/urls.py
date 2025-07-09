from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegistrationViewSet, CheckoutAPI

router = DefaultRouter()
router.register(r'', RegistrationViewSet, basename='registration')

urlpatterns = [
    path('', include(router.urls)),
    path('<int:pk>/checkout/', CheckoutAPI.as_view(), name='registration-checkout'),
]

