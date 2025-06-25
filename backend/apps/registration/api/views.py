<<<<<<< HEAD
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from apps.accounts.services import UserService
from apps.registration.services import RegistrationService
from .serializers import RegistrationCreateSerializer, RegistrationStatusSerializer

class RegistrationAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegistrationCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create user and user details
            user, user_detail = UserService.create_user_with_details(
                serializer.validated_data['user'],
                serializer.validated_data['user_detail']
            )
            
            # Create registration
            registration = RegistrationService.create_registration(
                user=user,
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date'],
                note=serializer.validated_data.get('note', '')
            )
            
            return Response({
                'registration_id': registration.id,
                'status': 'pending'
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class RegistrationStatusAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request, registration_id):
        try:
            registration = MeditationRegistration.objects.get(id=registration_id)
            serializer = RegistrationStatusSerializer(registration)
            return Response(serializer.data)
        except MeditationRegistration.DoesNotExist:
            return Response({'error': 'Registration not found'}, status=status.HTTP_404_NOT_FOUND)
=======
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
>>>>>>> bd3b997275c22bfffd438f8f91648aa3f7c6179b
