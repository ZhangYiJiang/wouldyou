import hashlib
import hmac
import json

import requests
from django.conf import settings

from . import models


def create_profile(backend, user, response, *args, **kwargs):
    """
    Creates Player user profile objects as part of the auth pipeline.
    Since most of a user's info cannot be obtained as part of the login
    API call, info like gender has to be obtained as part of another
    Graph API call, which we make here
    """
    if backend.name == 'facebook':
        fb = Facebook(user)
        fb_user = fb.user()

        try:
            player = models.Player.objects.get(uid=fb_user['id'])
        except models.Player.DoesNotExist:
            player = models.Player()

        player.user = user
        player.from_fb_user(fb_user)
        player.save()


def profile_context_processor(request):
    if request.user.is_authenticated:
        try:
            return {'player': request.user.player}
        except models.Player.DoesNotExist:
            return {}
    else:
        return {}


class Facebook:
    version = 'v2.7'
    url_prefix = 'https://graph.facebook.com'

    def __init__(self, user):
        self._user = user

    def _request(self, url):
        r = requests.get(url)
        return FacebookResponse(r, self)

    def _facebook_request(self, endpoint, data=None, method='get'):
        if data is None:
            data = {}

        url = '{}/{}/{}'.format(self.url_prefix, self.version, endpoint)
        if 'fields' in data:
            data['fields'] = ','.join(data['fields'])

        if method == 'get':
            r = requests.get(url, params=data)
        else:
            r = requests.request(method, url, data=data)

        return FacebookResponse(r, self)

    def _user_request(self, user_id, endpoint='', *args, **kwargs):
        """Injects access token into request data"""
        try:
            token = self._token
        except AttributeError:
            social = self._user.social_auth.get(provider='facebook')
            token = social.extra_data['access_token']
            self._token = token

        data = {
            'access_token': token,
            'appsecret_proof': self._app_secret_proof(token),
        }

        if not isinstance(user_id, str):
            data['ids'] = ','.join(user_id)
            url = endpoint
        else:
            url = '{}/{}'.format(user_id, endpoint).strip('/')

        kwargs['data'] = {**kwargs.get('data', {}), **data}
        return self._facebook_request(url, *args, **kwargs)

    def _app_secret_proof(self, token):
        """Generates app secret proof"""
        h = hmac.new(
            settings.SOCIAL_AUTH_FACEBOOK_SECRET.encode('utf-8'),
            msg=token.encode('utf-8'),
            digestmod=hashlib.sha256
        )
        return h.hexdigest()

    def user(self, user_id='me', fields=None):
        if fields is None:
            fields = ['id', 'name', 'picture', 'gender', ]

        return self._user_request(user_id, data={'fields': fields})

    def invitable_friends(self, user_id='me', picture_width=70):
        # TODO: Account for when the user declines to give permission
        return self._user_request(user_id, 'invitable_friends', data={
            # TODO: Figure out how Facebook's image width work
            'fields': [
                'name',
                'id',
                'picture.width({}).height({})'.format(picture_width, picture_width),
            ],
        })

    def friends(self, user_id='me', fields=None, picture_width=70):
        if fields is None:
            fields = [
                'name',
                'id',
                'picture.width({}).height({})'.format(picture_width, picture_width),
            ]
        return self._user_request(user_id, 'friends', data={'fields': fields})

    def picture(self, user_id='me', width=300, height=600):
        return '{}/{}/{}/picture?width={}&height={}'.format(self.url_prefix, self.version, user_id, width, height)


class FacebookResponse:
    def __init__(self, request, facebook):
        self.facebook = facebook
        data, paging = self.process_request(request)
        self.data = data
        self.paging = paging
        self.request = request

    def process_request(self, request):
        request.raise_for_status()
        json_data = json.loads(request.text)

        if 'data' in json_data:
            data = json_data['data']
        else:
            data = json_data

        if 'paging' in json_data:
            paging = json_data['paging']
        else:
            paging = None

        return data, paging

    def has_pages(self):
        return bool(self.paging)

    def __getitem__(self, item):
        return self.data[item]

    def __contains__(self, item):
        return item in self.data

    def __getattr__(self, item):
        return getattr(self.data, item)

    def __len__(self):
        return len(self.data)
