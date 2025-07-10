from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GuestQuestionViewSet

router = DefaultRouter()
router.register(r'', GuestQuestionViewSet, basename='guestquestion')

urlpatterns = [
    path('', include(router.urls)),
]

