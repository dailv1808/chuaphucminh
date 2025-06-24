from rest_framework import generics, status
from rest_framework.response import Response
from apps.registration.models import MeditationRegistration
from apps.registration.serializers import (
    RegistrationCreateSerializer,
    RegistrationStatusSerializer
)
from apps.registration.services import RegistrationService

class RegistrationAPIView(generics.CreateAPIView):
    serializer_class = RegistrationCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            registration = RegistrationService.create_registration(serializer.validated_data)
            return Response({
                'id': registration.id,
                'status': registration.status,
                'message': 'Registration submitted successfully'
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

class RegistrationStatusAPIView(generics.RetrieveAPIView):
    queryset = MeditationRegistration.objects.all()
    serializer_class = RegistrationStatusSerializer
    lookup_field = 'id'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
