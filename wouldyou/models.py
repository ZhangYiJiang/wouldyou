import random

from django.conf import settings
from django.db import models
from django.urls import reverse
from django.utils.html import format_html

from .facebook import Facebook

GENDER_CHOICES = (
    ('M', 'Male'),
    ('F', 'Female'),
)


class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Verb(BaseModel):
    verb = models.CharField(max_length=30)

    def __str__(self):
        return self.verb


class AbstractAction(BaseModel):
    verb = models.ForeignKey(Verb)
    player = models.ForeignKey('Player')

    @property
    def subject(self):
        raise NotImplementedError

    @property
    def set(self):
        raise NotImplementedError

    def __str__(self):
        return '{} {} {}'.format(self.player, self.verb, self.subject)

    class Meta:
        abstract = True


class ProfileAction(AbstractAction):
    profile = models.ForeignKey('Profile')
    profileset = models.ForeignKey('ProfileSet')

    @property
    def subject(self):
        return self.profile

    @property
    def set(self):
        return self.profileset


class PlayerAction(AbstractAction):
    friend = models.ForeignKey('Player', related_name='friend')
    friendset = models.ForeignKey('PlayerSet')

    @property
    def subject(self):
        return self.friend

    @property
    def set(self):
        return self.friendset


class AbstractSet(BaseModel):
    action_class = AbstractAction
    view_prefix = None

    @property
    def subjects(self):
        raise NotImplementedError

    def _create_subject(self, player, verb, set, subject):
        raise NotImplementedError

    def create_action(self, player, verbs):
        # TODO: Create an action representing 'skipped' even if verbs is empty
        actions = []
        for verb, subject_id in verbs:
            subject = self.subjects.filter(pk=subject_id).first()
            if subject:
                actions.append(self._create_subject(player, verb, self, subject))
        self.action_class.objects.bulk_create(actions)

    def get_absolute_url(self):
        return reverse('app:{}.play'.format(self.view_prefix), args=[str(self.pk)])

    def get_next_url(self):
        return reverse('app:{}.next'.format(self.view_prefix))

    class Meta:
        abstract = True


class ProfileSet(AbstractSet):
    action_class = ProfileAction
    view_prefix = 'profile'

    name = models.CharField(max_length=40, default='')
    profiles = models.ManyToManyField('Profile')

    @property
    def subjects(self):
        return self.profiles

    def _create_subject(self, player, verb, set, subject):
        return ProfileAction(player=player, verb=verb, profileset=set, profile=subject)

    def __str__(self):
        if self.name:
            return self.name
        else:
            return ' / '.join([str(x) for x in self.profiles.all()])


class PlayerSet(AbstractSet):
    action_class = PlayerAction
    view_prefix = 'player'

    players = models.ManyToManyField('Player')

    @property
    def subjects(self):
        return self.players

    def _create_subject(self, player, verb, set, subject):
        return PlayerAction(player=player, verb=verb, friendset=set, friend=subject)

    def __str__(self):
        return ' / '.join([str(x) for x in self.players.all()])


class AbstractProfile(BaseModel):
    set_model = AbstractSet

    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, default=1)
    name = models.CharField(max_length=100)

    @property
    def portrait(self):
        raise NotImplementedError

    def __str__(self):
        return self.name

    class Meta:
        abstract = True


class Player(AbstractProfile):
    set_model = PlayerSet

    user = models.OneToOneField(settings.AUTH_USER_MODEL, blank=True, null=True)
    image = models.URLField()
    uid = models.CharField(max_length=255)
    request = models.CharField(max_length=255, default='')

    @property
    def portrait(self):
        return self.facebook.picture()

    @property
    def facebook(self):
        if hasattr(self, '_facebook'):
            return self._facebook
        else:
            self._facebook = Facebook(self.user)
            return self._facebook

    def next_set(self, model):
        if model == Player:
            return self.next_playerset()
        elif model == Profile:
            return self.next_profileset()
        else:
            raise ValueError

    def next_playerset(self):
        """Generates a random set of friends for the player to play against"""
        # TODO: Consider caching this list locally instead
        friends_id = [f['id'] for f in self.facebook.friends()]
        played_sets = PlayerSet.objects.filter(playeraction__player=self)

        return

    def next_profileset(self):
        """Selects a random profile set from all unplayed profile sets"""
        not_played = ProfileSet.objects.exclude(profileaction__player=self).values_list('pk', flat=True)
        return ProfileSet.objects.get(pk=random.choice(not_played))

    def from_fb_user(self, fb_user):
        self.name = fb_user['name']
        self.uid = fb_user['id']
        self.gender = fb_user.get('gender', '')[:1].upper()
        try:
            self.image = fb_user['picture']['data']['url']
        except KeyError:
            pass
        return self


class Profile(AbstractProfile):
    set_model = ProfileSet

    image = models.ImageField()

    @property
    def portrait(self):
        return self.image

    def image_tag(self):
        return format_html('<img src="{}" alt="" style="max-width: 100px">', self.image.url)


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
