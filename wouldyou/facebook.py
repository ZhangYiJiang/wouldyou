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

        url = '{}/{}/{}'.format(self.url_prefix, self.version, endpoint)

        if 'fields' in data:
            data['fields'] = ','.join(data['fields'])

        if method == 'get':
            r = requests.get(url, params=data)
        else:
            r = requests.request(method, url, data=data)

        # TODO: Replace with better exceptions
        r.raise_for_status()
        return json.loads(r.text)

    def _user_request(self, endpoint, *args, **kwargs):
        """Injects access token into request data"""
        social = self.user.social_auth.get(provider='facebook')
        token = social.extra_data['access_token']
        token_data = {
            'access_token': token,
            'appsecret_proof': self._app_secret_proof(token),
        }
        kwargs['data'] = {**kwargs.get('data', {}), **token_data}
        return self._request(endpoint, *args, **kwargs)

    def _app_secret_proof(self, token):
        """Generates app secret proof"""
        h = hmac.new(
            settings.SOCIAL_AUTH_FACEBOOK_SECRET.encode('utf-8'),
            msg=token.encode('utf-8'),
            digestmod=hashlib.sha256
        )
        return h.hexdigest()

    def invitable_friends(self, user_id='me', picture_width=70):
        endpoint = '{}/invitable_friends'.format(user_id)
        return self._user_request(endpoint, data={
            # TODO: Figure out how Facebook's images work
            'fields': ['name', 'id', 'picture', ]
        })

    def friends(self, user_id='me', fields=None):
        if fields is None:
            fields = ['picture', 'name', 'id']

        endpoint = '{}/friends'.format(user_id)
        return self._user_request(endpoint, data={
            'fields': fields
        })
