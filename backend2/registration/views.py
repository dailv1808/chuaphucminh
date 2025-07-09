from rest_framework import viewsets
from .models import Registration
from .serializers import RegistrationSerializer
from django.utils import timezone
from kutiassignment.models import KutiAssignment
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser

class RegistrationViewSet(viewsets.ModelViewSet):
    queryset = Registration.objects.all()
    serializer_class = RegistrationSerializer

class CheckoutAPI(generics.UpdateAPIView):
    """
    API xử lý checkout (trả Kuti)
    PUT /api/registration/<id>/checkout/
    """
    permission_classes = [IsAdminUser]

    def update(self, request, *args, **kwargs):
        try:
            registration = Registration.objects.get(pk=kwargs['pk'])

            # Kiểm tra nếu đã checkout rồi
            if registration.status == 'checked_out':
                return Response(
                    {'error': 'Đã checkout trước đó'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Lấy tất cả assignments đang active
            active_assignments = registration.assignments.filter(is_active=True)

            if not active_assignments.exists():
                return Response(
                    {'error': 'Không tìm thấy Kuti được gán'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Cập nhật từng assignment
            for assignment in active_assignments:
                assignment.is_active = False
                assignment.released_at = timezone.now()
                assignment.save()

                # Cập nhật Kuti
                kuti = assignment.kuti
                kuti.is_available = True
                kuti.current_registration = None
                kuti.save()

            # Cập nhật Registration
            registration.status = 'checked_out'
            registration.kuti_assigned = False
            registration.save()

            return Response(
                {'message': 'Checkout thành công'},
                status=status.HTTP_200_OK
            )

        except Registration.DoesNotExist:
            return Response(
                {'error': 'Không tìm thấy đăng ký'},
                status=status.HTTP_404_NOT_FOUND
            )
