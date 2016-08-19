import requests
import hmac
import hashlib
import json
from django.conf import settings


class FacebookMixin:
    def dispatch(self, request, *args, **kwargs):
        self.facebook = Facebook(request.user)
        return super().dispatch(request, *args, **kwargs)


class Facebook:
    version = 'v2.7'
    url_prefix = 'https://graph.facebook.com'

    def __init__(self, user):
        self.user = user

    def _request(self, endpoint, data=None, method='get'):
        if data is None:
            data = {}
        # data['appsecret_proof'] = self._app_secret_proof()
        url = '{}/{}/{}'.format(self.url_prefix, self.version, endpoint)

        print(url)
        print(data)
        if method == 'get':
            r = requests.get(url, params=data)
        else:
            r = requests.request(method, data=data)
        # TODO: Replace with better exceptions
        print(r.text)
        r.raise_for_status()
        return json.loads(r.text)

    def _user_request(self, endpoint, *args, **kwargs):
        """Injects access token into request data"""
        social = self.user.social_auth.get(provider='facebook')
        token = {'access_token': social.extra_data['access_token']}
        kwargs['data'] = {**kwargs.get('data', {}), **token}
        return self._request(endpoint, *args, **kwargs)

    def _app_secret_proof(self):
        h = hmac.new(
            settings.SOCIAL_AUTH_FACEBOOK_SECRET.encode('utf-8'),
            msg=settings.SOCIAL_AUTH_FACEBOOK_KEY.encode('utf-8'),
            digestmod=hashlib.sha256
        )
        return h.hexdigest()

    def invitable_friends(self, user_id='me'):
        endpoint = '{}/invitable_friends'.format(user_id)
        return self._user_request(endpoint)

    def invite(self):
        # TODO: Complete this stub
        pass
