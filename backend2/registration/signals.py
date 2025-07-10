from django.db.models.signals import pre_delete
from django.dispatch import receiver
from registration.models import Registration
from kuti.models import Kuti
from kutiassignment.models import KutiAssignment

@receiver(pre_delete, sender=Registration)
def handle_registration_deletion(sender, instance, **kwargs):
    """
    Xử lý trước khi xóa Registration:
    1. Cập nhật trạng thái các Kuti được gán thành available
    2. Xóa các bản ghi KutiAssignment liên quan
    """
    # Lấy tất cả các assignment liên quan đến registration này
    assignments = KutiAssignment.objects.filter(registration=instance)
    
    # Cập nhật trạng thái available cho các Kuti được gán
    for assignment in assignments:
        kuti = assignment.kuti
        kuti.is_available = True
        kuti.save()
    
    # Xóa tất cả các assignment liên quan
    assignments.delete()
