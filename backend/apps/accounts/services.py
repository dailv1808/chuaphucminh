from django.contrib.auth import get_user_model
from .models import UserDetail

User = get_user_model()

class UserService:
    @staticmethod
    def create_user_with_details(user_data, user_detail_data):
        # Create user
        user = User.objects.create_user(
            phone=user_data['phone'],
            password=user_data['password']
        )
        
        # Create user details
        user_detail = UserDetail.objects.create(
            user=user,
            **user_detail_data
        )
        
        return user, user_detail
