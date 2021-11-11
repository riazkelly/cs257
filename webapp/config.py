#!/usr/bin/env python
'''
    config.py

    NOTE: I'M INCLUDING THIS FILE IN MY REPOSITORY TO SHOW YOU
    ITS FORMAT, BUT YOU SHOULD NOT KEEP CONFIG FILES WITH LOGIN
    CREDENTIALS IN YOUR REPOSITORY. In fact, I generally put a
    .gitignore file with "config.py" in it in whatever directory
    is supposed to house the config file. It's tricky to provide
    a config sample without accidentally pushing user names and
    passwords at a later time. Mostly, I try to illustrate the
    config file format in a readme file or in a code samples
    file, while .gitignore-ing the configs in the actual code
    directories.
'''

from oauthlib.oauth2 import WebApplicationClient
import os

# Change these values as appropriate for your postgresql setup.
database = 'fifa'
user = 'postgres'
password = 'Ilove<$'

SECRET_KEY = os.environ.get('SECRET_KEY') or os.urandom(24)

GOOGLE_CLIENT_ID = "900631144036-ml0eakqmhkk8039e86mpdlcs6l784uui.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET = "HXTvm8Qmn6Im5zoQ0WBN41Mx"
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

# OAuth 2 client setup
CLIENT_ = WebApplicationClient(GOOGLE_CLIENT_ID)
