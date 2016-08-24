import json
from time import sleep
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

"""
Celebrity data scraper. Pulls info from The Movie DB (https://www.themoviedb.org/)

To use -
 1. Make sure the packages 'requests' and 'BeautifulSoup' are installed -
  `pip3 install bs4`
 2. Make a copy of the state file - `cp state.json.example state.json`
 3. Run the script. This will take a while because we wait 5 seconds between
 each scrape to stop us from being banned.

 If the script stops for any reason, don't worry - it'll pick up from
 where left off since the state is saved in the state.json file

"""

url_base = 'https://www.themoviedb.org'
people_page = 'person'


def save_state(state):
    with open('state.json', mode='w', encoding='utf-8') as f:
        json.dump(state, f, indent='\t')


def save_actor(name, data):
    with open('results/{}.json'.format(name), mode='w', encoding='utf-8') as f:
        json.dump(data, f, indent='\t')


def get_page(url, page=None):
    if page is not None:
        params = {'page': page}
    else:
        params = {}

    r = requests.get(urljoin(url_base, url), params)
    r.raise_for_status()
    page = BeautifulSoup(r.text, 'html.parser')
    sleep(5)
    return page


def list_page(page_number):
    page = get_page(people_page, page_number)

    state['page'] = page_number
    save_state(state)
    skip = state['person']

    for i, a in list(enumerate(page.select('.fifty_square a')))[skip:]:
        p = get_page(a['href'])
        srcset = p.select_one('img.poster')['data-srcset'].split(',')
        name = p.select_one('.title h2 a').string.strip()

        actor = {
            'name': name,
            'image': srcset[-1].strip().split(' ')[0],
            'gender': p.find(string='Gender').parent.next_sibling.string.strip(),
        }

        save_actor(name, actor)
        print(name)
        state['person'] = i + 1
        save_state(state)


with open('state.json', encoding='utf-8') as f:
    state = json.load(f)

while True:
    list_page(state['page'])
    state['page'] += 1
    state['person'] = 0
    save_state(state)
