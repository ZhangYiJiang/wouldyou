from django.conf import settings
from django.conf.urls import url
from django.conf.urls.static import static

from . import views, models

""" wouldyou app URL configuration

Because this app uses Facebook canvas, all URLs must allow for trailing
slash.
"""

urlpatterns = [
    # Static pages
    url(r'^$', views.index, name='index'),
    url(r'^logout/$', views.logout, name='logout'),
    url(r'^welcome/$', views.OnboardView.as_view(), name='onboard'),
    url(r'^privacy/$', views.StaticView.as_view(page='privacy'), name='static.privacy'),

    # Game pages
    url(r'^celebrities/next/$', views.NextProfile.as_view(model=models.Profile), name='profile.next'),
    url(r'^celebrities/(?P<set_id>[0-9]+)/$', views.CelebrityGame.as_view(), name='profile.play'),

    url(r'^friends/invite/$', views.NeedMoreFriends.as_view(), name='player.invite'),

    url(r'^friends/next/$', views.NextProfile.as_view(model=models.Player), name='player.next'),
    url(r'^friends/(?P<set_id>[0-9]+)/$', views.PlayerGame.as_view(), name='player.play'),

    # Ajax views
    url(r'^api/invite/$', views.InviteView.as_view(), name='api.invite'),
    url(r'^api/action/$', views.ActionView.as_view(), name='api.action'),
    url(r'^disconnect/$', views.disconnect, name='disconnect'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
