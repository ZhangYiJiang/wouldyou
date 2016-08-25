import logging

from django.contrib.auth import logout as auth_logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect
from django.views import View

from .models import Verb, PlayerSet, ProfileSet, Player

logger = logging.getLogger(__name__)


def index(request):
    return render(request, 'wouldyou/pages/index.html')


def logout(request):
    auth_logout(request)
    return redirect('app:index')


class AjaxView(LoginRequiredMixin, View):
    def dispatch(self, request, *args, **kwargs):
        data = {'success': True}
        response = super().dispatch(request, *args, **kwargs)
        if response:
            data['data'] = response
        return JsonResponse(data)

    def post(self, request):
        raise NotImplementedError


class BaseView(LoginRequiredMixin, View):
    def http_method_not_allowed(self, request, *args, **kwargs):
        if request.method.lower() == 'post' and hasattr(self, 'get'):
            return self.get(request, *args, **kwargs)
        else:
            super().http_method_not_allowed(request, *args, **kwargs)


class OnboardView(BaseView):
    def get(self, request):
        player = request.user.player
        return render(request, 'wouldyou/pages/onboard.html', {
            'invitable': player.facebook.invitable_friends(),
            'friends': player.facebook.friends(),
        })


class NextProfile(BaseView):
    model = None

    def get(self, request):
        set_obj = request.user.player.next_set(self.model)
        return redirect(set_obj, set_id=set_obj.pk)

    def post(self, request):
        set_model = self.model.set_model
        set_id = request.POST.get('set_id', None)
        set_obj = set_model.objects.filter(pk=set_id).first()

        if set_obj:
            actions = []
            for verb in Verb.objects.all():
                profile_id = request.POST.get(str(verb), None)
                if profile_id is not None:
                    actions.append((verb, profile_id,))
            set_obj.create_action(request.user.player, actions)
        return self.get(request)


class GameView(BaseView):
    model = None

    def get(self, request, set_id):
        set_obj = get_object_or_404(self.model, pk=set_id)
        verbs = Verb.objects.all()
        return render(request, 'wouldyou/pages/game.html', {
            'set': set_obj,
            'verbs': verbs,
        })


class PlayerGame(GameView):
    model = PlayerSet


class CelebrityGame(GameView):
    model = ProfileSet


class InviteView(AjaxView):
    def post(self, request):
        player = request.user.player
        request_id = request.POST.get('response[request]')
        to_list = request.POST.getlist('response[to][]')

        players = []
        for friend in player.facebook.user(to_list).values():
            players.append(Player.from_fb_user(Player(request=request_id), friend))
        Player.objects.bulk_create(players)
