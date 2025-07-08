from rest_framework import serializers
from .models import KutiAssignment

class KutiAssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KutiAssignment
        fields = '__all__'
