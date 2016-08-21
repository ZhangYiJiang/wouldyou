from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings
from django.contrib.auth.models import User
from django.utils.html import format_html


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
    gender = models.CharField(max_length=20)

    def image_tag(self):
        return format_html('<img src="{}" alt="" style="max-width: 100px">', self.image.url)

    def __str__(self):
        return self.name


class ProfileSet(BaseModel):
    profiles = models.ManyToManyField(Profile)

    def __str__(self):
        return ' '.join([str(x) for x in self.profiles.all()])


class Action(BaseModel):
    verb = models.ForeignKey(Verb)
    user = models.ForeignKey(User)
    profile_set = models.ForeignKey(ProfileSet, default=None)

    limit = models.Q(app_label='django.contrib.auth', model=settings.AUTH_USER_MODEL) | \
            models.Q(app_label='wouldyou', model='Profile')

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to=limit
    )

    object_id = models.PositiveIntegerField()
    subject = GenericForeignKey()

    def popularity(self):
        """Percentage of people that select this option"""

    def __str__(self):
        return '{0!s} {0!s} {0!s}'.format(self.user, self.verb, self.subject)
