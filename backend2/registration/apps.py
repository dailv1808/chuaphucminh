from django.apps import AppConfig


class RegistrationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'registration'
    def ready(self):
        # Import signals khi app được khởi động
        import registration.signals
