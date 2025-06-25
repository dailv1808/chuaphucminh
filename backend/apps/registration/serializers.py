from rest_framework import serializers
from .models import MeditationRegistration
from apps.accounts.serializers import UserSerializer, UserDetailSerializer

class RegistrationCreateSerializer(serializers.Serializer):
    user = UserSerializer()
    user_detail = UserDetailSerializer()
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    note = serializers.CharField(required=False, allow_blank=True)

class RegistrationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeditationRegistration
        fields = ['id', 'status', 'rejection_reason', 'created_at', 'updated_at']
