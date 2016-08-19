from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.conf import settings


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

    def __str__(self):
        return self.name


class Action(BaseModel):
    verb = models.ForeignKey(Verb)
    user = models.ForeignKey(settings.AUTH_USER_MODEL)

    limit = models.Q(app_label='django.contrib.auth', model=settings.AUTH_USER_MODEL) | \
            models.Q(app_label='wouldyou', model='Profile')

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        limit_choices_to=limit
    )

    object_id = models.PositiveIntegerField()
    subject = GenericForeignKey()

    def __str__(self):
        return '{0!s} {0!s} {0!s}'.format(self.user, self.verb, self.subject)
