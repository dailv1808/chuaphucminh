from rest_framework import viewsets
from .models import GuestQuestion
from .serializers import GuestQuestionSerializer

class GuestQuestionViewSet(viewsets.ModelViewSet):
    queryset = GuestQuestion.objects.all().order_by('-created_at')
    serializer_class = GuestQuestionSerializer
