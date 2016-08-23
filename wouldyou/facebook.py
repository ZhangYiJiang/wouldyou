import hashlib
import hmac
import json

import requests
from django.conf import settings

from .models import Player


def create_profile(backend, user, response, *args, **kwargs):
    """
    Creates Player user profile objects as part of the auth pipeline.
    Since most of a user's info cannot be obtained as part of the login
    API call, info like gender has to be obtained as part of another
    Graph API call, which we make here
    """
    if backend.name == 'facebook':
        fb = Facebook(user)
        try:
            player = user.player
        except Player.DoesNotExist:
            player = Player(user=user)

        # TODO: Think of better design for restricting data
        # We need to match up the fields in the Player model with the
        # ones from the FB API. This is currently done manually, but
        # there might be a DRY-er way to do this
        fb_user = fb.user(fields=('gender', 'picture', ))
        player.gender = fb_user.get('gender', '')[:1].upper()
        try:
            player.picture = fb_user['picture']['data']['url']
        except KeyError:
            pass
        player.name = response['name']
        player.save()


def profile_context_processor(request):
    if request.user.is_authenticated:
        try:
            return {'player': request.user.player}
        except Player.DoesNotExist:
            return {}
    else:
        return {}


class FacebookMixin:
    def dispatch(self, request, *args, **kwargs):
        self.facebook = Facebook(request.user)
        return super().dispatch(request, *args, **kwargs)


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

    def _user_request(self, endpoint, *args, **kwargs):
        """Injects access token into request data"""
        try:
            token = self._token
        except AttributeError:
            social = self._user.social_auth.get(provider='facebook')
            token = social.extra_data['access_token']
            self._token = token

        token_data = {
            'access_token': token,
            'appsecret_proof': self._app_secret_proof(token),
        }
        kwargs['data'] = {**kwargs.get('data', {}), **token_data}
        return self._facebook_request(endpoint, *args, **kwargs)

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
            fields = ['picture', 'gender', ]

        return self._user_request(user_id, data={'fields': fields})

    def invitable_friends(self, user_id='me', picture_width=70):
        # TODO: Account for when the user declines to give permission
        endpoint = '{}/invitable_friends'.format(user_id)
        return self._user_request(endpoint, data={
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

        endpoint = '{}/friends'.format(user_id)
        return self._user_request(endpoint, data={'fields': fields})


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
