# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-26 08:03
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('wouldyou', '0018_auto_20160826_0334'),
    ]

    operations = [
        migrations.AlterField(
            model_name='playeraction',
            name='verb',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='wouldyou.Verb'),
        ),
        migrations.AlterField(
            model_name='profileaction',
            name='verb',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='wouldyou.Verb'),
        ),
    ]
