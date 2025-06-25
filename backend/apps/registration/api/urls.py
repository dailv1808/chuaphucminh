from django.urls import path
from apps.registration.api.views import (
    RegistrationAPIView,
    RegistrationStatusAPIView
)

urlpatterns = [
        path('registrations/', RegistrationAPIView.as_view(), name='registration-create'),
        path('registrations/<int:registration_id>/status/', RegistrationStatusAPIView.as_view(), name='registration-status'),
]
