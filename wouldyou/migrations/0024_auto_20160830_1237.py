# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-30 12:37
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('wouldyou', '0023_playerset_owner'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='profile',
            options={'ordering': ['name']},
        ),
    ]
