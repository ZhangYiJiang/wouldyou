def ignore_fb_csrf_middleware(get_response):
    def middleware(request):
        if request.user.is_authenticated and 'signed_request' in request.POST:
            request.csrf_processing_done = True
        return get_response(request)
    return middleware
