# Generated by Django 4.1.7 on 2023-04-25 12:21

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('lab1_api', '0008_stadium_description'),
    ]

    operations = [
        migrations.AlterField(
            model_name='club',
            name='league',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='league', to='lab1_api.competition'),
        ),
    ]
