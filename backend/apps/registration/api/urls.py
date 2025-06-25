from django.urls import path
from apps.registration.api.views import (
    RegistrationAPIView,
    RegistrationStatusAPIView
)

urlpatterns = [
<<<<<<< HEAD
        path('registrations/', RegistrationAPIView.as_view(), name='registration-create'),
        path('registrations/<int:registration_id>/status/', RegistrationStatusAPIView.as_view(), name='registration-status'),
=======
    path('registrations/', RegistrationAPIView.as_view(), name='registration-create'),
    path('registrations/<int:id>/status/', RegistrationStatusAPIView.as_view(), name='registration-status'),
>>>>>>> bd3b997275c22bfffd438f8f91648aa3f7c6179b
]
