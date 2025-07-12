from rest_framework import viewsets, permissions
from .models import Kuti
from .serializers import KutiSerializer

class KutiViewSet(viewsets.ModelViewSet):
    queryset = Kuti.objects.all()
    serializer_class = KutiSerializer
    def get_permissions(self):
        if self.action == 'list':  # GET /registrations/
            permission_classes = [permissions.IsAdminUser]
        elif self.action == 'create':  # POST /registrations/
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update']:  # PUT/PATCH /registrations/<id>/
            permission_classes = [permissions.IsAdminUser]
        elif self.action == 'destroy':  # DELETE /registrations/<id>/
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]    

    def destroy(self, request, *args, **kwargs):
        kuti = self.get_object()
        if not kuti.is_available:
            return Response(
                {"error": "Không thể xóa Kuti đang có người"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
