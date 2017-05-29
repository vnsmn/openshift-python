# -*- coding: utf-8 -*-

from django.db import models
from django.contrib.auth.models import User


class UserResources(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    url = models.CharField(max_length=128, db_index=False, unique=False, verbose_name="URL")

    def __str__(self):
        return self.user.username + '; ' + self.url

    class Meta:
        db_table = "user_resources"
        verbose_name = "resource of user"
        verbose_name_plural = "resource of user"
        app_label = 'core'
