from django.shortcuts import render
from .facebook import FacebookMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View


def index(request):
    return render(request, 'wouldyou/pages/index.html')


class BaseView(LoginRequiredMixin, FacebookMixin, View):
    pass


class OnboardView(BaseView):
    def get(self, request):
        return render(request, 'wouldyou/pages/onboard.html', {
            'invitable': self.facebook.invitable_friends(),
        })
