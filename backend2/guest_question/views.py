from django.db.models import Q, Case, When, Value, IntegerField
from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from .models import GuestQuestion
from .serializers import GuestQuestionSerializer
from accounts.permissions import IsAdminOrStaff


class GuestQuestionPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200


class GuestQuestionViewSet(viewsets.ModelViewSet):
    queryset = GuestQuestion.objects.all().order_by('-created_at')
    serializer_class = GuestQuestionSerializer

    def _as_bool(self, value):
        if value is None:
            return None
        value = str(value).strip().lower()
        if value in ['1', 'true', 'yes', 'on']:
            return True
        if value in ['0', 'false', 'no', 'off']:
            return False
        return None

    def _get_ordering(self, ordering_param):
        allowed = {
            'updated_at', '-updated_at',
            'created_at', '-created_at',
            'priority', '-priority',
        }
        if ordering_param in allowed:
            return ordering_param
        return '-created_at'

    def get_queryset(self):
        queryset = GuestQuestion.objects.all()
        params = self.request.query_params
        model_fields = {f.name for f in GuestQuestion._meta.get_fields()}

        search = params.get('search')
        if search:
            search_q = (
                Q(name__icontains=search)
                | Q(content__icontains=search)
                | Q(edited_content__icontains=search)
                | Q(short_content__icontains=search)
                | Q(answer__icontains=search)
                | Q(group__icontains=search)
                | Q(tags__icontains=search)
                | Q(contact__icontains=search)
            )
            if 'display_name' in model_fields:
                search_q = search_q | Q(display_name__icontains=search)
            queryset = queryset.filter(search_q)

        status = params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        priority = params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)

        group = params.get('group')
        if group:
            queryset = queryset.filter(group__icontains=group)

        tags = params.get('tags')
        if tags:
            queryset = queryset.filter(tags__icontains=tags)

        updated_by = params.get('updated_by')
        if updated_by:
            queryset = queryset.filter(updated_by_id=updated_by)

        created_by = params.get('created_by')
        if created_by:
            queryset = queryset.filter(created_by_id=created_by)

        slideshow = self._as_bool(params.get('slideshow'))
        if slideshow is not None:
            queryset = queryset.filter(slideshow=slideshow)

        is_faq = self._as_bool(params.get('is_faq'))
        if is_faq is not None:
            queryset = queryset.filter(is_faq=is_faq)

        ordering = self._get_ordering(params.get('ordering'))
        priority_first = self._as_bool(params.get('priority_first')) is True

        # Priority ordering: high -> medium -> low
        priority_rank_expr = Case(
            When(priority='high', then=Value(0)),
            When(priority='medium', then=Value(1)),
            When(priority='low', then=Value(2)),
            default=Value(3),
            output_field=IntegerField(),
        )

        if priority_first:
            queryset = queryset.annotate(priority_rank=priority_rank_expr)
            secondary_ordering = ordering
            if secondary_ordering in ['priority', '-priority']:
                secondary_ordering = '-created_at'
            return queryset.order_by('priority_rank', secondary_ordering, '-id')

        if ordering in ['priority', '-priority']:
            queryset = queryset.annotate(priority_rank=priority_rank_expr)
            if ordering.startswith('-'):
                return queryset.order_by('-priority_rank', '-id')
            return queryset.order_by('priority_rank', '-id')

        return queryset.order_by(ordering)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        use_pagination = self._as_bool(request.query_params.get('paginated')) is True

        if use_pagination:
            paginator = GuestQuestionPagination()
            page = paginator.paginate_queryset(queryset, request, view=self)
            serializer = self.get_serializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action == 'list':  # GET /registrations/
            permission_classes = [permissions.AllowAny]
        elif self.action == 'create':  # POST /registrations/
            permission_classes = [permissions.AllowAny]
        elif self.action in ['update', 'partial_update']:  # PUT/PATCH /registrations/<id>/
            permission_classes = [IsAdminOrStaff]
        elif self.action == 'destroy':  # DELETE /registrations/<id>/
            permission_classes = [IsAdminOrStaff]
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
