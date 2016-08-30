import logging

from django.contrib.auth import logout as auth_logout
from django.contrib.auth import settings
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render, redirect
from django.views import View

from . import facebook
from .models import Verb, PlayerSet, ProfileSet, Player

logger = logging.getLogger(__name__)


def index(request):
    return render(request, 'wouldyou/pages/index.html')


def logout(request):
    auth_logout(request)
    return redirect('app:index')


class StaticView(View):
    page = None

    def get(self, request):
        return render(request, 'wouldyou/pages/static/{}.html'.format(self.page))

    def post(self, request):
        return self.get(request)


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
        return render(request, 'wouldyou/game/onboard.html', {
            'invitable': player.facebook.invitable_friends(),
            'friends': player.friends.all(),
        })


class NextProfile(BaseView):
    model = None

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.set_model = self.model.set_model

    def get(self, request):
        if 'prev' in request.GET:
            set_obj = self.set_model.objects.filter(pk=request.GET['prev']).first()
            if set_obj:
                set_obj.skip_set(request.user.player)

        next_obj = request.user.player.next_set(self.model)
        if next_obj is None:
            return redirect('app:player.invite')

        return redirect(next_obj, set_id=next_obj.pk)

    def post(self, request):
        set_id = request.POST.get('set_id', None)
        set_obj = self.set_model.objects.filter(pk=set_id).first()
        player = request.user.player

        if set_obj:
            actions = []
            for verb in Verb.objects.all():
                profile_id = request.POST.get(str(verb), None)
                if profile_id is not None:
                    actions.append((verb, profile_id,))
            if actions:
                set_obj.create_action(player, actions)
            else:
                set_obj.skip_set(player)
        return self.get(request)


class GameView(BaseView):
    model = None
    template = None

    def validate(self, request, set_id):
        return get_object_or_404(self.model, pk=set_id)

    def get(self, request, set_id):
        set_obj = self.validate(request, set_id)
        verbs = Verb.objects.all()
        stats, total = set_obj.stats
        return render(request, self.template, {
            'set': set_obj,
            'verbs': verbs,
            'stats': stats,
            'total': total,
        })


class PlayerGame(GameView):
    model = PlayerSet
    template = 'wouldyou/game/player.html'

    def validate(self, request, set_id):
        if not request.user.player.owned_sets.filter(pk=set_id).exists():
            raise PermissionDenied
        return super().validate(request, set_id)


class CelebrityGame(GameView):
    model = ProfileSet
    template = 'wouldyou/game/profile.html'


class NeedMoreFriends(BaseView):
    def get(self, request):
        return render(request, 'wouldyou/game/invite.html')


class InviteView(AjaxView):
    def post(self, request):
        request_id = request.POST.get('response[request]')
        to_list = request.POST.getlist('response[to][]')
        request.user.player.invite(to_list, request_id)


class ActionView(AjaxView):
    models = (PlayerSet, ProfileSet, )

    def get_model(self, view):
        for model in self.models:
            if model.view_prefix == view:
                return model
        raise ValueError

    def post(self, request):
        model = self.get_model(request.POST['model'])
        set = model.objects.get(pk=request.POST['set'])
        subject = set.subjects.get(pk=request.POST['subject'])
        verb = Verb.objects.get(pk=request.POST['verb'])

        player = request.user.player
        action = set.create_subject_action(player, verb, set, subject)
        action.save()


def disconnect(request):
    secret_key = settings.SOCIAL_AUTH_FACEBOOK_SECRET
    data = facebook.parse_signed_request(request.POST['signed_request'], secret_key)
    removed_user_id = data['user_id']
    Player.objects.filter(uid=removed_user_id).delete()

    return redirect('app:index')
