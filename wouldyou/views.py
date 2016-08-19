from django.shortcuts import render
from .facebook import FacebookMixin
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views import View


def index(request):
    return render(request, 'wouldyou/pages/index.html')


class BaseView(LoginRequiredMixin, FacebookMixin, View):
    pass


def after_login(request):
    """Decide where the user should go after logging in"""
    # TODO: Complete this stub


def onboard(request):
    # TODO: Complete this stub
    pass


