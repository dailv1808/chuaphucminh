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
