from rest_framework import viewsets
from .models import Kuti
from .serializers import KutiSerializer

class KutiViewSet(viewsets.ModelViewSet):
    queryset = Kuti.objects.all()
    serializer_class = KutiSerializer


