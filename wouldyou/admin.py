from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from django.contrib.contenttypes.admin import GenericTabularInline

from . import models


class ActionInline(GenericTabularInline):
    model = models.Action


@admin.register(models.Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('name', 'gender', 'image_tag', )
    list_filter = ('gender', )
    inlines = [ActionInline, ]


class CustomUserAdmin(UserAdmin):
    inlines = [
        ActionInline,
    ]


class ProfileInline(admin.TabularInline):
    model = models.ProfileSet.profiles.through
    max_num = 3
    min_num = 3


@admin.register(models.ProfileSet)
class ProfileSetAdmin(admin.ModelAdmin):
    inlines = [
        ProfileInline,
    ]
    exclude = ('profiles', )

admin.site.register(models.Action)
admin.site.register(models.Verb)

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
