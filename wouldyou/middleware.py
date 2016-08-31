from debug_toolbar.middleware import DebugToolbarMiddleware
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings


def fb_skip_security_middleware(get_response):
    def middleware(request):
        # TODO: Double check this does not create a CSRF security hole
        if 'signed_request' in request.POST:
            request.csrf_processing_done = True
        response = get_response(request)
        response.xframe_options_exempt = True
        return response
    return middleware


class PatchedDebugToolbarMiddleware(MiddlewareMixin, DebugToolbarMiddleware):
    pass


def show_toolbar(request):
    if request.is_ajax():
        return False

    return bool(settings.DEBUG)
