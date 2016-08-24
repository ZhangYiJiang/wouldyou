from django.core.files.base import ContentFile
from django.core.management import BaseCommand
from wouldyou.models import Profile
from django.utils.text import slugify
from time import sleep

from urllib.parse import urlparse
import requests
import os
import json


class Command(BaseCommand):
    can_import_settings = True

    def _save_image(self, profile, url):
        path = urlparse(url).path
        ext = os.path.splitext(path)[1]
        image_name = slugify(url) + '.' + ext

        r = requests.get(url)
        r.raise_for_status()
        image_content = ContentFile(r.content)
        profile.image.save(image_name, image_content)

    def add_arguments(self, parser):
        parser.add_argument('path', type=str)

    def handle(self, *args, **options):
        from django.conf import settings
        path = os.path.join(settings.BASE_DIR, options['path'])

        for file in os.scandir(path=path):
            if not file.is_file():
                continue

            try:
                with open(file.path, encoding='utf-8') as f:
                    data = json.load(f)
            except ValueError:
                message = 'Failed when parsing {} as JSON'.format(file.path)
                self.stderr.write(self.style.WARNING(message))
                continue

            if Profile.objects.filter(name=data['name']).exists():
                continue

            profile = Profile(name=data['name'], gender=data['gender'][:1])
            try:
                self._save_image(profile, data['image'])
            except requests.HTTPError:
                message = 'Failed to retrieve {} image from {}'.format(data['name'], data['image'])
                self.stderr.write(self.style.WARNING(message))
                continue

            profile.save()
            self.stdout.write(self.style.SUCCESS('{} successfully created!'.format(profile.name)))
            sleep(1)
