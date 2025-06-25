from django.contrib import admin
from kuti.models import Kuti
class KutiAdmin(admin.ModelAdmin):
    def get_list_display(self, request):
        return [field.name for field in self.model._meta.fields]
    list_filter = ('code', 'is_avaiable')
    search_fields = ('code', 'note')
    list_display_links = ('code',)
    ordering = ['updated_at']
admin.site.register(Kuti, KutiAdmin)
