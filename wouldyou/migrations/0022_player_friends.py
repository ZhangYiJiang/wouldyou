# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-28 15:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wouldyou', '0021_playerset_player_id_set'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='friends',
            field=models.ManyToManyField(to='wouldyou.Player'),
        ),
    ]
