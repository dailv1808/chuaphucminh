from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
# Import từ thư mục registration
from registration.models import Registration
from registration.serializers import RegistrationSerializer

# Import từ thư mục kuti
from kuti.models import Kuti
from kuti.serializers import KutiSerializer

# Import local models/serializers
from .models import KutiAssignment
from .serializers import KutiAssignmentSerializer


class KutiAssignmentViewSet(viewsets.ModelViewSet):
    queryset = KutiAssignment.objects.all()
    serializer_class = KutiAssignmentSerializer

    def create(self, request, *args, **kwargs):
        registration_id = request.data.get('registration')
        kuti_id = request.data.get('kuti')

        try:
            registration = Registration.objects.get(pk=registration_id)
            kuti = Kuti.objects.get(pk=kuti_id)

            # Check if kuti is available
            if not kuti.is_available:
                return Response(
                    {'error': 'Kuti is not available'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Check gender compatibility
            if (kuti.gender_allowed != 'All' and
                kuti.gender_allowed != registration.gender):
                return Response(
                    {'error': 'Kuti gender restriction not met'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create assignment
            assignment = KutiAssignment.objects.create(
                registration=registration,
                kuti=kuti,
                note=request.data.get('note', '')
            )

            # Mark kuti as unavailable
            kuti.is_available = False
            kuti.save()

            serializer = self.get_serializer(assignment)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except (Registration.DoesNotExist, Kuti.DoesNotExist):
            return Response(
                {'error': 'Invalid registration or kuti ID'},
                status=status.HTTP_400_BAD_REQUEST
            )
