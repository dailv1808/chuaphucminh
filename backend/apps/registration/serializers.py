from rest_framework import serializers
<<<<<<< HEAD
from .models import MeditationRegistration
from apps.accounts.serializers import UserSerializer, UserDetailSerializer

class RegistrationCreateSerializer(serializers.Serializer):
    user = UserSerializer()
    user_detail = UserDetailSerializer()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    note = serializers.CharField(required=False, allow_blank=True)
=======
from apps.accounts.models import User, UserDetail
from apps.registration.models import MeditationRegistration

class RegistrationCreateSerializer(serializers.Serializer):
    # User fields
    phone = serializers.CharField(max_length=20)
    password = serializers.CharField(write_only=True, required=False)
    
    # UserDetail fields
    cccd = serializers.CharField(max_length=12)
    fullname = serializers.CharField(max_length=128)
    gender = serializers.ChoiceField(choices=UserDetail.GENDER_CHOICES)
    birthday = serializers.DateField(required=False, allow_null=True)
    email = serializers.EmailField(required=False, allow_null=True)
    address = serializers.CharField(required=False, allow_null=True)
    emergency_phone = serializers.CharField(required=False, allow_null=True, max_length=15)
    note = serializers.CharField(required=False, allow_null=True)
    
    # Registration fields
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    
    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date must be after start date")
        return data
    
    def create(self, validated_data):
        # Extract user data
        phone = validated_data.pop('phone')
        password = validated_data.pop('password', None)
        
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
            defaults=validated_data
        )
        
        # Create registration
        registration = MeditationRegistration.objects.create(
            user=user,
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            status='pending'
        )
        
        return registration
>>>>>>> bd3b997275c22bfffd438f8f91648aa3f7c6179b

class RegistrationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeditationRegistration
        fields = ['id', 'status', 'rejection_reason', 'created_at', 'updated_at']
