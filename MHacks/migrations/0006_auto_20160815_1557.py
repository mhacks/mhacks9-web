# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-08-15 22:57
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MHacks', '0005_auto_20160815_1655'),
    ]

    operations = [
        migrations.AlterField(
            model_name='application',
            name='from_state',
            field=models.CharField(default='', max_length=64),
        ),
        migrations.AlterField(
            model_name='application',
            name='grad_date',
            field=models.DateField(blank=True),
        ),
        migrations.AlterField(
            model_name='application',
            name='major',
            field=models.CharField(blank=True, default='', max_length=255),
        ),
    ]
