from django.db import transaction
from apps.accounts.models import User, UserDetail
from apps.registration.models import MeditationRegistration

class RegistrationService:
    @staticmethod
    @transaction.atomic
    def create_registration(registration_data):
        # Extract user data
        phone = registration_data.pop('phone')
        password = registration_data.pop('password', None)
        
        # Create or get user
        user, created = User.objects.get_or_create(
            phone=phone,
            defaults={'username': phone}
        )
        
        if created and password:
            user.set_password(password)
            user.save()
        
        # Create or update user detail
        user_detail, _ = UserDetail.objects.update_or_create(
            user=user,
            defaults=registration_data
        )
        
        # Create registration
        registration = MeditationRegistration.objects.create(
            user=user,
            start_date=registration_data['start_date'],
            end_date=registration_data['end_date'],
            status='pending'
        )
        
        return registration
