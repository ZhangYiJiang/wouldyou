import logging

from django.contrib.auth import logout as auth_logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect
from django.views import View

from .facebook import FacebookMixin
from .models import Action, Verb, ProfileSet, Invite

logger = logging.getLogger(__name__)


def index(request):
    return render(request, 'wouldyou/pages/index.html')


def logout(request):
    auth_logout(request)
    return redirect('app:index')


class AjaxView(LoginRequiredMixin, FacebookMixin, View):
    def dispatch(self, request, *args, **kwargs):
        try:
            data = {'success': True}
            response = super().dispatch(request, *args, **kwargs)
            if response:
                data['data'] = response
            return JsonResponse(data)
        except Exception as e:
            logger.error(e)
            return JsonResponse({
                'error': e,
            }, status=500)

    def post(self, request):
        raise NotImplementedError


class BaseView(LoginRequiredMixin, FacebookMixin, View):
    def http_method_not_allowed(self, request, *args, **kwargs):
        if request.method.lower() == 'post' and hasattr(self, 'get'):
            return self.get(request, *args, **kwargs)
        else:
            super().http_method_not_allowed(request, *args, **kwargs)


class OnboardView(BaseView):
    def get(self, request):
        return render(request, 'wouldyou/pages/onboard.html', {
            'invitable': self.facebook.invitable_friends(),
            'friends': self.facebook.friends(),
        })


class NextProfileView(BaseView):
    def get(self, request):
        profileset = request.user.player.next_profileset()
        return redirect('app:game.play', profileset_id=profileset.pk)

    def post(self, request):
        profileset_id = request.POST.get('profileset_id', None)
        if profileset_id:
            profileset = ProfileSet.objects.get(pk=profileset_id)
            profiles = profileset.profiles
            actions = []
            for verb in Verb.objects.all():
                profile_id = request.POST.get(str(verb), None)
                profile = profiles.filter(pk=profile_id).first()
                if profile:
                    actions.append(Action(
                        verb=verb,
                        profile_set=profileset,
                        subject=profile,
                        player=request.user.player,
                    ))

            if actions:
                Action.objects.bulk_create(actions)

        return self.get(request)


class GameView(BaseView):
    def get(self, request, profileset_id):
        profileset = get_object_or_404(ProfileSet, pk=profileset_id)
        verbs = Verb.objects.all()
        return render(request, 'wouldyou/pages/game.html', {
            'profileset': profileset,
            'verbs': verbs,
        })


class InviteView(AjaxView):
    def post(self, request):
        player = request.user.player
        request_id = request.POST.get('response[request]')
        to_list = request.POST.getlist('response[to][]')
        Invite.objects.bulk_create([
            Invite(request=request_id, to=to, player=player) for to in to_list
        ])
