# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2016-08-29 15:53
from __future__ import unicode_literals

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('wouldyou', '0022_player_friends'),
    ]

    operations = [
        migrations.AddField(
            model_name='playerset',
            name='owner',
            field=models.ForeignKey(default=0, on_delete=django.db.models.deletion.CASCADE, related_name='owned_sets', to='wouldyou.Player'),
            preserve_default=False,
        ),
    ]
