from django import template
from django.shortcuts import resolve_url
from django.templatetags.static import StaticNode

register = template.Library()


@register.simple_tag(takes_context=True)
def static_absolute(context, path):
    url = StaticNode.handle_simple(path)
    return context['request'].build_absolute_uri(url)


@register.simple_tag(takes_context=True)
def url_absolute(context, path):
    url = resolve_url(path)
    return context['request'].build_absolute_uri(url)
