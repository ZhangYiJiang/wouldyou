from django import template

register = template.Library()


@register.simple_tag(takes_context=True)
def profile(context, key):
    social = context.request.user.social_auth.get(provider='facebook')
    return social.extra_data.get(key, None)