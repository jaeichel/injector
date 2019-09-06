from oauthlib.oauth2 import BackendApplicationClient
from oauthlib.oauth2 import TokenExpiredError
from requests_oauthlib import OAuth2Session

import json
import os
import sys

client_id = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
client_secret = 'XXXXXXXXXXXXXXXXXXXXXX'
token_filepath = 'token.json'

def token_saver(token):
    with open(token_filepath, 'w') as token_file:
        json.dump(token, token_file)

def token_loader():
    if os.path.exists(token_filepath):
        with open(token_filepath, 'r') as token_file:
            return json.load(token_file)
    return None

def create_oauth_token():
    scope = ['https://www.googleapis.com/auth/photoslibrary']

    oauth = OAuth2Session(client_id=client_id, scope=scope, redirect_uri='urn:ietf:wg:oauth:2.0:oob')
    authorization_url, state = oauth.authorization_url(
            'https://accounts.google.com/o/oauth2/auth',
            access_typie="offline",
            prompt="select_account")
    print '%s' % authorization_url
    authorization_code = raw_input('Enter the authorization code: ')

    token = oauth.fetch_token(
            'https://accounts.google.com/o/oauth2/token',
            code=authorization_code,
            client_secret=client_secret)

    return token

def create_load_token(token_filepath='token.json'):
    token = token_loader()
    if not token:
        token = create_oauth_token()
        token_saver(token)
    return token

def refresh_token(token):
    client = OAuth2Session(client_id, token=token)
    refresh_url = 'https://accounts.google.com/o/oauth2/token'
    token = client.refresh_token(refresh_url, client_id=client_id, client_secret=client_secret)
    token_saver(token)
    return token

def oauth_request_get(token, protected_url):
    try:
        client = OAuth2Session(client_id, token=token)
        resp = client.get(protected_url)
    except TokenExpiredError as e:
        token = refresh_token(token)
        client = OAuth2Session(client_id, token=token)
        resp = client.get(protected_url)
    return resp

def oauth_request_post(token, protected_url, data, headers):
    try:
        client = OAuth2Session(client_id, token=token)
        resp = client.post(protected_url, data=data, headers=headers)
    except TokenExpiredError as e:
        token = refresh_token(token)
        client = OAuth2Session(client_id, token=token)
        resp = client.post(protected_url, data=data, headers=headers)
    return resp

def get_albums(token):
    resp = oauth_request_get(token, 'https://photoslibrary.googleapis.com/v1/albums')
    json_data = json.loads(resp.text)
    print json_data

    albums = json_data['albums']
    while 'nextPageToken' in json_data:
        resp = oauth_request_get(token, 'https://photoslibrary.googleapis.com/v1/albums?pageToken=' + json_data['nextPageToken'])
        json_data = json.loads(resp.text)
        albums.extend(json_data['albums'])
    return albums

def get_or_create_album(token, albums, album_title):
    for album in albums:
        if album['title'] == album_title:
            return album

    url = 'https://photoslibrary.googleapis.com/v1/albums'
    body = {
        'album' : {
            'title': album_title
        }
    }

    bodySerialized = json.dumps(body)
    r = oauth_request_post(token, url, bodySerialized, None)
    album = json.loads(r.text)
    albums.append(album)
    return album

def upload_image(token, image_filepath):
    f = open(image_filepath, 'rb').read();

    url = 'https://photoslibrary.googleapis.com/v1/uploads'
    headers = {
        'Content-Type': 'application/octet-stream',
        'X-Goog-Upload-File-Name': image_filepath,
        'X-Goog-Upload-Protocol': "raw",
    }

    r = oauth_request_post(token, url, f, headers)
    print '\nUpload token: %s' % r.content
    return r.content

def add_image_to_album(token, upload_token, albumId):
    url = 'https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate'

    body = {
        'newMediaItems' : [
            {
                "simpleMediaItem": {
                    "uploadToken": upload_token
                }
            }
        ]
    }

    if albumId is not None:
        body['albumId'] = albumId;

    bodySerialized = json.dumps(body);
    headers = {
        'Content-Type': 'application/json',
    }

    r = oauth_request_post(token, url, bodySerialized, headers)
    return r;

# //authenticate user and build service
token = create_load_token()
print token


root_directory = sys.argv[1]
root_directory_prefix = root_directory

def get_sub_dirs(directory):
    return [os.path.join(directory, sub_dir) for sub_dir in os.listdir(directory) if os.path.isdir(os.path.join(directory, sub_dir))]

def recursive_search(directory):
    sub_dirs = get_sub_dirs(directory)
    if len(sub_dirs) == 0:
        return [directory]

    last_sub_dirs = []
    for sub_dir in sub_dirs:
        child_sub_dirs = recursive_search(sub_dir)
        last_sub_dirs.extend(child_sub_dirs)
    return last_sub_dirs

def load_processed_files(processed_filepath='processed_files.txt'):
    processed_files = {}
    if os.path.isfile(processed_filepath):
        with open(processed_filepath, 'r') as processed_file:
            for line in processed_file:
                processed_files[line] = True
    return processed_files

def append_processed_files(filename, processed_filepath='processed_files.txt'):
     with open(processed_filepath, 'a') as processed_file:
         processed_file.write(filename + '\n')

def upload_photos_in_dir(token, albums, processed_files, dir):
    dir_name = dir.replace(root_directory_prefix, '').strip('/')
    album = get_or_create_album(token, albums, dir_name)
    print(album)

    for image_path in os.listdir(dir):
        image_fullpath = os.path.join(dir, image_path)
        if os.path.isfile(image_fullpath) and image_fullpath not in processed_files:
            print(image_fullpath)
            upload_token = upload_image(token, image_fullpath)
            resp = add_image_to_album(token, upload_token, album['id'])
            append_processed_files(image_fullpath)

processed_files = load_processed_files()
albums = get_albums(token)
all_dirs = recursive_search(root_directory)
for dir in all_dirs:
    upload_photos_in_dir(token, albums, processed_files, dir)

