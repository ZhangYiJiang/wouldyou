from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static

from . import views

""" wouldyou app URL configuration

Because this app uses Facebook canvas, all URLs must allow for trailing
slash.
"""

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^logout/$', views.logout, name='logout'),
    url(r'^welcome/$', views.OnboardView.as_view(), name='onboard'),

    url(r'^game/next/$', views.NextProfileView.as_view(), name='game.next'),
    url(r'^game/(?P<profileset_id>[0-9]+)/$', views.GameView.as_view(), name='game.play'),

    # Ajax views
    url(r'^api/invite/$', views.InviteView.as_view(), name='api.invite'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
