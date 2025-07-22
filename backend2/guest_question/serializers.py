from rest_framework import serializers
from .models import GuestQuestion
from accounts.models import Account

class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id', 'username', 'full_name']

class GuestQuestionSerializer(serializers.ModelSerializer):
    created_by = SimpleUserSerializer(read_only=True)
    updated_by = SimpleUserSerializer(read_only=True)

    class Meta:
        model = GuestQuestion
        fields = '__all__'