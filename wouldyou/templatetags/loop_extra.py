from django import template

register = template.Library()


@register.simple_tag
def get_range(*args):
    return range(*args)