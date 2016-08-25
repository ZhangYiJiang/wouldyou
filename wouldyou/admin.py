from django.contrib import admin
from django.forms import ModelForm, ValidationError, RadioSelect

from . import models


class ProfileForm(ModelForm):
    class Meta:
        widgets = {
            'gender': RadioSelect()
        }


@admin.register(models.Profile)
class ProfileAdmin(admin.ModelAdmin):
    form = ProfileForm
    list_display = ('name', 'gender', 'image_tag', )
    list_filter = ('gender', )


class AbstractProfileInline(admin.TabularInline):
    max_num = 3
    min_num = 3


class ProfileInline(AbstractProfileInline):
    model = models.ProfileSet.profiles.through


@admin.register(models.ProfileSet)
class ProfileSetAdmin(admin.ModelAdmin):
    inlines = [ProfileInline, ]
    exclude = ('profiles', )


class PlayerInline(AbstractProfileInline):
    model = models.PlayerSet.players.through


@admin.register(models.PlayerSet)
class PlayerSetAdmin(admin.ModelAdmin):
    inlines = [PlayerInline, ]
    exclude = ('players', )


admin.site.register(models.Verb)
admin.site.register(models.Player)
admin.site.register(models.Invite)
admin.site.register(models.PlayerAction)
admin.site.register(models.ProfileAction)
