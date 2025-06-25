from .models import MeditationRegistration

class RegistrationService:
    @staticmethod
    def create_registration(user, start_date, end_date, note=None):
        registration = MeditationRegistration.objects.create(
            user=user,
            start_date=start_date,
            end_date=end_date,
            note=note,
            status='pending'
        )
        return registration
