from django.shortcuts import render


def index(request):
    return render(request, 'wouldyou/pages/index.html')
