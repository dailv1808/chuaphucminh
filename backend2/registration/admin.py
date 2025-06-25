from django.contrib import admin
from registration.models import Registration
class RegistrationAdmin(admin.ModelAdmin):
#    list_display = ('id', 'phone_number', 'start_date', 'end_date', 'status')
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    list_display_links = ('email', 'phone_number', 'full_name')
    list_filter = ('status', 'start_date')
    search_fields = ('phone_number', 'fullname')
    date_hierarchy = 'start_date'
    readonly_fields = ('created_at', 'updated_at')
    ordering = ['updated_at']
admin.site.register(Registration, RegistrationAdmin)
