from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from accounts.models import Account

class AccountAdmin(UserAdmin):
    list_display = ('email', 'phone_number', 'full_name', 'last_login', 'date_joined', 'is_active')
    list_display_links = ('email', 'phone_number', 'full_name')
    readonly_fields = ('last_login', 'date_joined')

    ordering = ['phone_number']  # ✅ Fix lỗi ở đây

    # Có thể thêm các trường tìm kiếm và lọc nếu cần
    search_fields = ('email', 'phone_number', 'full_name')
    filter_horizontal = ()
    list_filter = ()
    fieldsets = ()  # Có thể tùy chỉnh để hiển thị đúng form user

admin.site.register(Account, AccountAdmin)

