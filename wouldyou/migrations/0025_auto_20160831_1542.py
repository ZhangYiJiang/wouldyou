# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-31 15:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wouldyou', '0024_auto_20160830_1237'),
    ]

    operations = [
        migrations.AlterField(
            model_name='player',
            name='uid',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]