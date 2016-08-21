def fb_skip_security_middleware(get_response):
    def middleware(request):
        if request.user.is_authenticated and 'signed_request' in request.POST:
            request.csrf_processing_done = True
        response = get_response(request)
        response.xframe_options_exempt = True
        return response
    return middleware
