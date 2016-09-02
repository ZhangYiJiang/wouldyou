import random

from django import template

from wouldyou.facebook import Facebook
from wouldyou.models import Verb

register = template.Library()


@register.simple_tag(takes_context=True)
def get_count(context, subject, verb):
    return context['stats'].get((subject.pk, verb.pk, ), 0)


@register.simple_tag(takes_context=True)
def get_total(context, subject):
    # Return one instead of zero to avoid divide by zero error
    return context['total'].get(subject.pk, 1)


@register.simple_tag(takes_context=True)
def get_percentage(context, subject, verb):
    return round(get_count(context, subject, verb) / get_total(context, subject) * 100)


@register.simple_tag(takes_context=True)
def matching_friend(context, friend):
    verb_pk = context['set'].matching_friend_actions.get(friend.pk, None)
    if verb_pk is not None:
        return Verb.objects.get(pk=verb_pk)
    return None


@register.simple_tag
def subject_portrait(subject, width, height=None):
    if height is None:
        height = width
    return Facebook.picture(subject.uid, width, height)


@register.simple_tag
def random_exclamation():
    return random.choice(['OMG!', 'Oh yeah!', 'Fantastic!', 'Wooo!', 'Geronimo!', 'Awesome!', ])
