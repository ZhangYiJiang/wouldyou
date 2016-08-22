from django.contrib.auth import logout as auth_logout
from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import render, redirect
from django.views import View

from .facebook import FacebookMixin


def index(request):
    return render(request, 'wouldyou/pages/index.html')


def logout(request):
    auth_logout(request)
    return redirect('/')


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
