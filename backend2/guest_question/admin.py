from django.contrib import admin
from .models import GuestQuestion

@admin.register(GuestQuestion)
class GuestQuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'short_content', 'status', 'priority', 'answered_at', 'created_at')
    list_filter = ('status', 'priority', 'group', 'tags',)
    search_fields = ('name', 'email', 'content', 'short_content',)
    autocomplete_fields = ['tags', 'group']
    readonly_fields = ['created_at', 'answered_at']

# @admin.register(QuestionGroup)
# class QuestionGroupAdmin(admin.ModelAdmin):
#     search_fields = ['name']

# @admin.register(QuestionTag)
# class QuestionTagAdmin(admin.ModelAdmin):
#     search_fields = ['name']

