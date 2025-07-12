from rest_framework import serializers
from .models import GuestQuestion

class GuestQuestionSerializer(serializers.ModelSerializer):

    class Meta:
        model = GuestQuestion
        fields = '__all__'

