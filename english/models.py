# -*- coding: utf-8 -*-
# pip install jsonfield==2.0.2
# sudo pip install django==1.8

from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.auth.models import User


class Topics(models.Model):
    title = models.CharField(max_length=50, db_index=False, unique=True, verbose_name="Название")
    name = models.CharField(max_length=50, db_index=True, unique=True, verbose_name="Название")
    template = models.CharField(max_length=128, db_index=False, unique=False, verbose_name="--")

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'topics'
        ordering = ["title", "name"]
        verbose_name = "--"
        verbose_name_plural = "--"
        app_label = 'english'


class Topic(models.Model):
    topic = models.ForeignKey(Topics, on_delete=models.CASCADE)
    name = models.CharField(max_length=128, db_index=False, unique=False, verbose_name="Название")
    data = models.TextField()

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'topic'
        unique_together = ('topic', 'name')
        verbose_name = "--"
        verbose_name_plural = "--"
        app_label = 'english'


# https://pypi.python.org/pypi/jsonfield/2.0.2
# https://docs.djangoproject.com/en/dev/ref/contrib/postgres/fields/#jsonfield
class UserTopic(models.Model):
    user_id = models.IntegerField(db_index=False, unique=False)
    name = models.CharField(max_length=128, db_index=False, unique=False, verbose_name="Название")
    data = models.TextField()
    topic = models.ForeignKey(Topics, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'user_topic'
        unique_together = ('user_id', 'topic')
        verbose_name = "--"
        verbose_name_plural = "--"
        app_label = 'english'


class UserJsnData(models.Model):
    user_id = models.IntegerField(db_index=False, unique=False)
    name = models.CharField(max_length=128, db_index=False, unique=False, verbose_name="Название")
    data = JSONField(verbose_name='data in json format')

    def __str__(self):
        return self.name

    class Meta:
        db_table = 'user_jsn_data'
        unique_together = ('user_id', 'name')
        verbose_name = "--"
        verbose_name_plural = "--"
        app_label = 'english'


class Dictionary(models.Model):
    user_id = models.IntegerField(db_index=False, unique=False)
    word = models.CharField(max_length=128, db_index=False, unique=False, verbose_name="")
    learnt = models.BooleanField(db_index=False, unique=False, verbose_name="")

    def __str__(self):
        return self.word

    class Meta:
        db_table = 'dictionary'
        unique_together = ('user_id', 'word')
        verbose_name = "--"
        verbose_name_plural = "--"
        app_label = 'english'

