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
    url(r'^welcome/$', views.OnboardView.as_view(), name='onboard'),
    url(r'^privacy/$', views.StaticView.as_view(page='privacy'), name='static.privacy'),
    url(r'^how-app-works/$', views.StaticView.as_view(page='how-app-works'), name='static.how-app-works'),

    # Actions
    url(r'^disconnect/$', views.disconnect, name='disconnect'),
    url(r'^logout/$', views.logout, name='logout'),

    # Game pages

    url(r'^celebrities/next/$', views.NextProfile.as_view(model=models.Profile), name='profile.next'),
    url(r'^celebrities/(?P<set_id>[0-9]+)/$', views.CelebrityGame.as_view(), name='profile.play'),

    url(r'^friends/invite/$', views.NeedMoreFriends.as_view(), name='player.invite'),
    url(r'^celebrities/end/$', views.OutOfCelebrities.as_view(), name='profile.end'),

    url(r'^friends/next/$', views.NextProfile.as_view(model=models.Player), name='player.next'),
    url(r'^friends/(?P<set_id>[0-9]+)/$', views.PlayerGame.as_view(), name='player.play'),

    # Facebook meta views
    url(r'meta/celebrities/(?P<profile_id>[0-9]+)/$', views.CelebrityMeta.as_view(), name='facebook.profile'),

    # Ajax views
    url(r'^api/invite/$', views.InviteView.as_view(), name='api.invite'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
