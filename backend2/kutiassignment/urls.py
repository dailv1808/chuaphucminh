from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssignKutiAPI, KutiAssignmentListAPI

#router = DefaultRouter()
#router.register(r'', AssignKutiAPI, basename='kutiassignment')

urlpatterns = [
 #   path('', include(router.urls)),
    path('assign/', AssignKutiAPI.as_view(), name='assign-kuti'),  # POST để gán Kuti
    path('list/', KutiAssignmentListAPI.as_view(), name='kuti-assignment-list'),  # GET danh sách gán Kuti
]


