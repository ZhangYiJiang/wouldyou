import random

from django.conf import settings
from django.db import models
from django.db.models import Count, F
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
    verb = models.ForeignKey(Verb, blank=True, null=True)
    player = models.ForeignKey('Player')

    @property
    def subject(self):
        raise NotImplementedError

    @property
    def set(self):
        raise NotImplementedError

    def __str__(self):
        if self.subject is None:
            return '{} skipped set {}'.format(self.player, self.set)
        else:
            return '{} {} {}'.format(self.player, self.verb, self.subject)

    class Meta:
        abstract = True


class ProfileAction(AbstractAction):
    profile = models.ForeignKey('Profile', blank=True, null=True)
    profileset = models.ForeignKey('ProfileSet')

    @property
    def subject(self):
        return self.profile

    @property
    def set(self):
        return self.profileset


class PlayerAction(AbstractAction):
    friend = models.ForeignKey('Player', related_name='friend', blank=True, null=True)
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

    @property
    def actions(self):
        raise NotImplementedError

    @property
    def stats(self):
        values = self.actions.values('subject', 'verb')\
            .annotate(count=Count('verb'))
        stats = {}
        total = {}
        for value in values:
            stats[(value['subject'], value['verb'])] = value['count']
            total[value['subject']] = total.get(value['subject'], 0) + value['count']
        return stats, total

    def create_subject(self, player, verb, set, subject):
        raise NotImplementedError

    def create_action(self, player, verbs):
        actions = []
        for verb, subject_id in verbs:
            subject = self.subjects.filter(pk=subject_id).first()
            if subject:
                actions.append(self.create_subject(player, verb, self, subject))
        self.action_class.objects.bulk_create(actions)

    def skip_set(self, player):
        if not self.actions.filter(player=player).exists():
            action = self.create_subject(player, None, self, None)
            action.save()

    def get_absolute_url(self):
        return reverse('app:{}.play'.format(self.view_prefix), args=[str(self.pk)])

    def get_next_url(self):
        return reverse('app:{}.next'.format(self.view_prefix))

    def __str__(self):
        return ' / '.join(str(x) for x in self.subjects.all())

    class Meta:
        abstract = True


class ProfileSet(AbstractSet):
    action_class = ProfileAction
    view_prefix = 'profile'

    name = models.CharField(max_length=40, default='', blank=True)
    profiles = models.ManyToManyField('Profile')

    @property
    def subjects(self):
        return self.profiles

    @property
    def actions(self):
        return self.profileaction_set.annotate(subject=F('profile'))

    def create_subject(self, player, verb, set, subject):
        return ProfileAction(player=player, verb=verb, profileset=set, profile=subject)

    def __str__(self):
        if self.name:
            return self.name
        else:
            return super().__str__()


class PlayerSet(AbstractSet):
    action_class = PlayerAction
    view_prefix = 'player'

    players = models.ManyToManyField('Player')
    player_id_set = models.CharField(max_length=100)
    owner = models.ForeignKey('Player', related_name='owned_sets')

    def save(self, *args, **kwargs):
        if self.pk:
            id_list = self.players.values_list('uid', flat=True)
            self.player_id_set = '{},{},{}'.format(*sorted(id_list))
        super().save(*args, **kwargs)

    @classmethod
    def make(cls, player, player_uids):
        if isinstance(player_uids, str):
            player_uids = player_uids.split(',')
        new_set = cls.objects.create(owner=player)
        new_set.players = Player.objects.filter(uid__in=player_uids)
        new_set.save()
        return new_set

    @property
    def subjects(self):
        return self.players

    @property
    def actions(self):
        return self.playeraction_set.annotate(subject=F('player'))

    def create_subject(self, player, verb, set, subject):
        return PlayerAction(player=player, verb=verb, friendset=set, friend=subject)


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

    friends = models.ManyToManyField('Player')

    @property
    def portrait(self):
        return Facebook.picture(self.uid)

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
        friends_id = set(self.friends.values_list('uid', flat=True))
        played_sets = self.owned_sets.all()
        not_played_with = set(self.friends.exclude(playerset__in=played_sets)\
            .values_list('uid', flat=True))

        # If we have more than three friends not played with, simply generate
        # a new set using those unplayed friends
        if len(not_played_with) >= 3:
            sample = random.sample(not_played_with, 3)
            return PlayerSet.make(self, sample)

        # Otherwise we randomly generate a few sets and try to use that
        id_str = set()
        played_with = friends_id - not_played_with
        sample_size = 3 - len(not_played_with)
        for i in range(10):
            players = not_played_with | set(random.sample(played_with, sample_size))
            id_str |= {'{},{},{}'.format(*sorted(players))}

        existing_sets = set(played_sets.filter(player_id_set__in=id_str)\
            .values_list('player_id_set', flat=True))
        try:
            return PlayerSet.make(self, (id_str - existing_sets).pop())
        except KeyError:
            # TODO: Decide on what to do when there aren't any more sets
            pass
        return

    def next_profileset(self):
        """Selects a random profile set from all unplayed profile sets"""
        not_played = ProfileSet.objects.exclude(profileaction__player=self).values_list('pk', flat=True)
        return ProfileSet.objects.get(pk=random.choice(not_played))

    def invite(self, friends, request_id):
        new_players = []
        cls = type(self)
        for friend in self.facebook.user(friends).values():
            new_players.append(cls.from_fb_user(cls(request=request_id), friend))
        cls.objects.bulk_create(new_players)
        self.friends.add(*cls.objects.filter(uid__in=friends))

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
        return self.image.url

    def image_tag(self):
        return format_html('<img src="{}" alt="" style="max-width: 100px">', self.image.url)

    class Meta:
        ordering = ['name', ]
