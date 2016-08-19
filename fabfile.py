from fabric.api import *
from contextlib import contextmanager as _contextmanager

env.hosts = ['wouldyou.space', ]
env.user = 'app'
env.directory = '$HOME/cs3216_wouldyou'
env.activate = 'source $HOME/wouldyou_env/bin/activate'

@_contextmanager
def virtualenv():
    with cd(env.directory):
        with prefix(env.activate):
            yield

def deploy():
    with virtualenv():
        run('git pull')
        run('pip install -q -r requirements.txt')
        run('./manage.py migrate --noinput')
        run('./manage.py collectstatic --noinput')

def createsuperuser():
    with virtualenv():
        run('./manage.py createsuperuser')