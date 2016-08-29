"""
Django settings for cs3216_wouldyou project.

Generated by 'django-admin startproject' using Django 1.10.

For more information on this file, see
https://docs.djangoproject.com/en/1.10/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.10/ref/settings/
"""

import os

import environ

env = environ.Env()
environ.Env.read_env()

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


SECRET_KEY = env('SECRET_KEY')
DEBUG = env('DEBUG')

ALLOWED_HOSTS = [
    'wouldyou.space',
]


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Python Social Auth
    'social.apps.django_app.default',
    # Django Debug toolbar
    'debug_toolbar',

    # Would You app
    'wouldyou',
]

MIDDLEWARE = [
    'wouldyou.middleware.PatchedDebugToolbarMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'wouldyou.middleware.fb_skip_security_middleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF = 'cs3216_wouldyou.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                # Python Social Auth
                'social.apps.django_app.context_processors.backends',
                'social.apps.django_app.context_processors.login_redirect',
                # Django Settings Export
                'django_settings_export.settings_export',
                # App context processor
                'wouldyou.facebook.profile_context_processor',
            ],
        },
    },
]

WSGI_APPLICATION = 'cs3216_wouldyou.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.10/ref/settings/#databases

DATABASES = {
    'default': env.db(),
}


# Password validation
# https://docs.djangoproject.com/en/1.10/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Python Social Authentication
# http://psa.matiasaguirre.net/docs/index.html

AUTHENTICATION_BACKENDS = (
    'social.backends.facebook.Facebook2OAuth2',
    'social.backends.facebook.Facebook2AppOAuth2',

    'django.contrib.auth.backends.ModelBackend',
)

SOCIAL_AUTH_FACEBOOK_KEY = env('FACEBOOK_APP')
SOCIAL_AUTH_FACEBOOK_SECRET = env('FACEBOOK_SECRET')
SOCIAL_AUTH_FACEBOOK_NAMESPACE = 'wouldyouspace'

SOCIAL_AUTH_FACEBOOK_SCOPE = ['user_friends', ]

SOCIAL_AUTH_LOGIN_REDIRECT_URL = '/welcome/'

LOGIN_URL = '/login/facebook/'

SOCIAL_AUTH_PIPELINE = (
    'social.pipeline.social_auth.social_details',
    'social.pipeline.social_auth.social_uid',
    'social.pipeline.social_auth.auth_allowed',
    'social.pipeline.social_auth.social_user',
    'social.pipeline.user.get_username',
    'social.pipeline.user.create_user',
    'social.pipeline.social_auth.associate_user',
    'social.pipeline.social_auth.load_extra_data',
    'social.pipeline.user.user_details',
    # Custom create profile function mixed into auth pipeline
    # See http://psa.matiasaguirre.net/docs/pipeline.html#extending-the-pipeline
    'wouldyou.facebook.create_profile',
)

# Internationalization
# https://docs.djangoproject.com/en/1.10/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.10/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = 'static'

MEDIA_URL = '/media/'
MEDIA_ROOT = 'media'

# Settings export - Settings included here will be exported to templates
# https://github.com/jkbrzt/django-settings-export

SETTINGS_EXPORT = [
    'SOCIAL_AUTH_FACEBOOK_KEY',
]

# Debug toolbar options
# http://django-debug-toolbar.readthedocs.io/en/stable/index.html

DEBUG_TOOLBAR_PATCH_SETTINGS = False

DEBUG_TOOLBAR_CONFIG = {
    'SHOW_TOOLBAR_CALLBACK': 'wouldyou.middleware.show_toolbar',
}


# Logging
# See: https://docs.djangoproject.com/en/1.10/topics/logging/

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/log',
            'maxBytes': 5 * 1024 * 1024,
            'backupCount': 20,
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console', ],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
