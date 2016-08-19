from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from . import models


class ActionInline(GenericTabularInline):
    model = models.Action


class ProfileAdmin(admin.ModelAdmin):
    inlines = [
        ActionInline,
    ]


class CustomUserAdmin(UserAdmin):
    inlines = [
        ActionInline,
    ]

admin.site.register(models.Action)
admin.site.register(models.Verb)
admin.site.register(models.Profile, ProfileAdmin)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
