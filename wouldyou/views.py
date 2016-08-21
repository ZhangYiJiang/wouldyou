from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render
from django.views import View

from .facebook import FacebookMixin


def index(request):
    return render(request, 'wouldyou/pages/index.html')


class BaseView(LoginRequiredMixin, FacebookMixin, View):
    def get(self, request):
        raise NotImplementedError

    def post(self, request):
        return self.get(request)


class OnboardView(BaseView):
    def get(self, request):
        return render(request, 'wouldyou/pages/onboard.html', {
            'invitable': self.facebook.invitable_friends(),
        })
