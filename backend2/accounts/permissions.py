from rest_framework.permissions import BasePermission


class IsAdminOrStaff(BasePermission):
    """
    Allow users flagged as internal admin (`is_admin`) or Django staff (`is_staff`).
    """

    def has_permission(self, request, view):
        user = request.user
        return bool(
            user
            and user.is_authenticated
            and (getattr(user, "is_admin", False) or getattr(user, "is_staff", False))
        )
