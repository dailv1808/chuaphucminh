from django.db import models
from registration.models import Registration
from kuti.models import Kuti

class KutiAssignment(models.Model):
    registration = models.ForeignKey(Registration, on_delete=models.CASCADE, related_name='assignments')
    kuti = models.ForeignKey(Kuti, on_delete=models.CASCADE, related_name='assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ('registration', 'kuti')  # Một người không nên được gán nhiều lần cho 1 kuti
        verbose_name = 'Kuti Assignment'
        verbose_name_plural = 'Kuti Assignments'

    def __str__(self):
        return f"{self.registration.fullname} → {self.kuti.code}"

