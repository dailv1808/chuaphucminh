# Generated by Django 4.2.23 on 2025-07-10 11:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('guest_question', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='guestquestion',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True, verbose_name='Email'),
        ),
    ]
