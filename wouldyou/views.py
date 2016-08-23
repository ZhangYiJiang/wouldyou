from django.contrib.auth import logout as auth_logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.views import View
import logging

from .facebook import FacebookMixin
from . import models

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
    def get(self, request):
        raise NotImplementedError

    def post(self, request):
        return self.get(request)


class OnboardView(BaseView):
    def get(self, request):
        return render(request, 'wouldyou/pages/onboard.html', {
            'invitable': self.facebook.invitable_friends(),
            'friends': self.facebook.friends(),
        })


class InviteView(AjaxView):
    def post(self, request):
        player = request.user.player
        request_id = request.POST.get('response[request]')
        to_list = request.POST.getlist('response[to][]')
        models.Invite.objects.bulk_create([
            models.Invite(request=request_id, to=to, player=player) for to in to_list
        ])
