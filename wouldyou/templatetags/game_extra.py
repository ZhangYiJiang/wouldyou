from django import template

register = template.Library()


@register.simple_tag(takes_context=True)
def get_count(context, subject, verb):
    return context['stats'].get((subject.pk, verb.pk, ), 0)


@register.simple_tag(takes_context=True)
def get_total(context, subject):
    return context['total'].get(subject.pk, 0)


@register.simple_tag(takes_context=True)
def get_percentage(context, subject, verb):
    return get_count(context, subject, verb) / get_total(context, subject) * 100
