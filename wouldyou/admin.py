from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from django.forms import ModelForm, ValidationError, RadioSelect

from . import models


class ActionInline(GenericTabularInline):
    model = models.Action


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
    inlines = [ActionInline, ]


class ProfileInlineForm(ModelForm):
    def clean(self):
        profile = self.fields['profile']
        profile_set = self.fields['profileset_set'].profiles
        if not profile_set.filter(profile=profile).exists():
            raise ValidationError
        return super().clean()


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
admin.site.register(models.Player)
admin.site.register(models.Invite)
