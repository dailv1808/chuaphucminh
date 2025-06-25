from django.contrib import admin
from .models import KutiAssignment

class KutiAssignmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'registration', 'kuti', 'assigned_at')
    search_fields = ('registration__fullname', 'kuti__code')
    list_filter = ('kuti',)
    ordering = ['-assigned_at']

admin.site.register(KutiAssignment, KutiAssignmentAdmin)


