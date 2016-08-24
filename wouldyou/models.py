import random

from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models
from django.utils.html import format_html

GENDER_CHOICES = (
    ('M', 'Male'),
    ('F', 'Female'),
)


class Player(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES)
    image = models.URLField(default='')
    name = models.CharField(max_length=100)

    def next_profileset(self):
        """Selects a random profile set from all unplayed profile sets"""
        not_played = ProfileSet.objects.exclude(action__player=self).values_list('pk', flat=True)
        return ProfileSet.objects.get(pk=random.choice(not_played))

    def __str__(self):
        return self.name


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Verb(BaseModel):
    verb = models.CharField(max_length=30)

    def __str__(self):
        return self.verb


class Profile(BaseModel):
    name = models.CharField(max_length=200)
    image = models.ImageField()
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default=1)

    def image_tag(self):
        return format_html('<img src="{}" alt="" style="max-width: 100px">', self.image.url)

    def __str__(self):
        return self.name


class ProfileSet(BaseModel):
    name = models.CharField(max_length=40, default='')
    profiles = models.ManyToManyField(Profile)

    def __str__(self):
        if self.name:
            return self.name
        else:
            return ' / '.join([str(x) for x in self.profiles.all()])


class Action(BaseModel):
    verb = models.ForeignKey(Verb)
    player = models.ForeignKey(Player)
    profile_set = models.ForeignKey(ProfileSet, default=None)

    limit = models.Q(app_label='wouldyou', model=Player) | \
            models.Q(app_label='wouldyou', model=Profile)

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to=limit
    )

    object_id = models.PositiveIntegerField()
    subject = GenericForeignKey()

    def __str__(self):
        return '{0!s} {0!s} {0!s}'.format(self.player, self.verb, self.subject)


class Invite(BaseModel):
    player = models.ForeignKey(Player)
    request = models.CharField(max_length=255)
    to = models.CharField(max_length=255)

    @property
    def request_id(self):
        # From https://developers.facebook.com/docs/games/services/gamerequests#responsedata
        return '{}_{}'.format(self.request, self.to)

    def __str__(self):
        return self.request_id
