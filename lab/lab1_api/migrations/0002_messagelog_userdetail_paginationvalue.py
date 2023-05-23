# Generated by Django 4.1.7 on 2023-05-23 18:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('lab1_api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MessageLog',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('sender', models.CharField(max_length=100)),
                ('message', models.TextField()),
            ],
        ),
        migrations.AddField(
            model_name='userdetail',
            name='paginationValue',
            field=models.IntegerField(default=12),
        ),
    ]