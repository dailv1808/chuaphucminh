from rest_framework import viewsets
from .models import Kuti
from .serializers import KutiSerializer

class KutiViewSet(viewsets.ModelViewSet):
    queryset = Kuti.objects.all()
    serializer_class = KutiSerializer

    def destroy(self, request, *args, **kwargs):
        kuti = self.get_object()
        if not kuti.is_available:
            return Response(
                {"error": "Không thể xóa Kuti đang có người"},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)
