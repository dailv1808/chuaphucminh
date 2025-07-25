# Generated by Django 4.2.23 on 2025-07-19 03:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('guest_question', '0005_guestquestion_contact'),
    ]

    operations = [
        migrations.AlterField(
            model_name='guestquestion',
            name='status',
            field=models.CharField(choices=[('answered', 'Đã trả lời'), ('pending', 'Chưa trả lời'), ('archive', 'Lưu trữ'), ('reject', 'Từ chối'), ('review', 'Cần xem xét')], default='pending', max_length=10, verbose_name='Trạng thái'),
        ),
    ]
