from rest_framework import serializers
from .models import Kuti

class KutiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Kuti
        fields = '__all__'

