# Generated by Django 4.1.7 on 2023-05-24 11:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lab1_api', '0002_messagelog_userdetail_paginationvalue'),
    ]

    operations = [
        migrations.AddField(
            model_name='messagelog',
            name='userID',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='userMessage', to=settings.AUTH_USER_MODEL),
        ),
    ]