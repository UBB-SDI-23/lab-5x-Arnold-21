# Generated by Django 4.1.7 on 2023-05-08 15:06

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lab1_api', '0006_club_user_competition_user_matchesplayed_user_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='club',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='club', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='competition',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='competition', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='matchesplayed',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='match', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='stadium',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='stadium', to=settings.AUTH_USER_MODEL),
        ),
    ]
