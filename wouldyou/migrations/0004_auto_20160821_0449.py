# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-21 04:49
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wouldyou', '0003_auto_20160821_0446'),
    ]

    operations = [
        migrations.AlterField(
            model_name='profile',
            name='gender',
            field=models.CharField(choices=[('M', 'Male'), ('F', 'Female')], default=1, max_length=20),
        ),
    ]