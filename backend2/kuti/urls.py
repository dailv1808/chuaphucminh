from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import KutiViewSet

router = DefaultRouter()
router.register(r'', KutiViewSet, basename='kuti')

urlpatterns = [
    path('', include(router.urls)),
]


