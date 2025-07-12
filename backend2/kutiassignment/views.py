from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from kutiassignment.models import KutiAssignment
from kutiassignment.serializers import KutiAssignmentSerializer
from registration.models import Registration
from kuti.models import Kuti

class AssignKutiAPI(generics.CreateAPIView):
    """
    API gán Kuti cho người dùng
    {
        "registration_id": 1,
        "kuti_id": 1
    }
    """
    serializer_class = KutiAssignmentSerializer
    #permission_classes = [IsAdminUser]

    def create(self, request, *args, **kwargs):
        registration_id = request.data.get('registration_id')
        kuti_id = request.data.get('kuti_id')

        try:
            registration = Registration.objects.get(id=registration_id)
            kuti = Kuti.objects.get(id=kuti_id)

            # Validate
            if not kuti.is_available:
                return Response(
                    {'error': 'Kuti này đã được gán'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if kuti.gender_allowed not in ['All', registration.gender]:
                return Response(
                    {'error': 'Kuti không phù hợp giới tính'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Tạo assignment
            assignment = KutiAssignment.objects.create(
                registration=registration,
                kuti=kuti,
                is_active=True
            )

            # Cập nhật các model liên quan
            kuti.is_available = False
            kuti.current_registration = registration
            kuti.save()

            registration.kuti_assigned = True
            if registration.status == 'approved':
                registration.status = 'checked_in'
            registration.save()

            return Response(
                self.serializer_class(assignment).data,
                status=status.HTTP_201_CREATED
            )

        except (Registration.DoesNotExist, Kuti.DoesNotExist) as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_404_NOT_FOUND
            )

class KutiAssignmentListAPI(generics.ListAPIView):
    """API danh sách KutiAssignment (GET)"""
    serializer_class = KutiAssignmentSerializer
    # permission_classes = [IsAdminUser]

    def get_queryset(self):
        queryset = KutiAssignment.objects.all()
        
        # Filter theo registration_id (nếu có)
        registration_id = self.request.query_params.get('registration_id')
        if registration_id:
            queryset = queryset.filter(registration_id=registration_id)
        
        # Filter theo kuti_id (nếu có)
        kuti_id = self.request.query_params.get('kuti_id')
        if kuti_id:
            queryset = queryset.filter(kuti_id=kuti_id)
        
        # Filter theo trạng thái is_active (nếu có)
        is_active = self.request.query_params.get('is_active')
        if is_active:
            queryset = queryset.filter(is_active=(is_active.lower() == 'true'))
        
        return queryset
