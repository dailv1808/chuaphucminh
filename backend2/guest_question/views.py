from rest_framework import viewsets, permissions
from .models import GuestQuestion
from .serializers import GuestQuestionSerializer

class GuestQuestionViewSet(viewsets.ModelViewSet):
    queryset = GuestQuestion.objects.all().order_by('-created_at')
    serializer_class = GuestQuestionSerializer
    def get_permissions(self):
        if self.action == 'list':  # GET /registrations/
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':  # POST /registrations/
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update']:  # PUT/PATCH /registrations/<id>/
            permission_classes = [permissions.IsAdminUser]
        elif self.action == 'destroy':  # DELETE /registrations/<id>/
            permission_classes = [permissions.IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]

        return [permission() for permission in permission_classes]

## 2 phan nay de xu ly viec gan created_by va updated_by vao cau hoi
    def perform_create(self, serializer):
        # Chỉ gán user nếu đã đăng nhập
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user, updated_by=self.request.user)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        # Chỉ gán user nếu đã đăng nhập
        if self.request.user.is_authenticated:
            serializer.save(updated_by=self.request.user)
        else:
            serializer.save()