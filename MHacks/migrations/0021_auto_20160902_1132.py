# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-09-02 18:32
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('MHacks', '0020_auto_20160901_1049'),
    ]

    operations = [
        migrations.AlterField(
            model_name='registration',
            name='t_shirt_size',
            field=models.CharField(choices=[(b'S', b'S'), (b'M', b'M'), (b'L', b'L'), (b'XL', b'XL')], max_length=2),
        ),
    ]
