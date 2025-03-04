import requests
import json
import re
from rapidfuzz import process
import sys
import os
from flask import jsonify
import time

cse_request_url = 'https://www.googleapis.com/customsearch/v1'
cse_cx = '009651248597238434110:rv56718xitr'
cse_key = 'AIzaSyDO22ReOgKlXN-1xQ3Mg78fiKTi-AB7NEg'


def query_existing_data(question):
    with open("data.txt", "r", encoding="utf-8") as f:
        lines = f.readlines()
    best_match = process.extractOne(question, lines)
    if (best_match and best_match[1] > 75):
        return best_match[0] + " " + lines[best_match[2] + 1]
    else:
        return "No existing match found"

def get_search_results(question):
    querystring = {'cx': cse_cx, 'key': cse_key, 'q': question}
    results = json.loads(requests.request(
        'GET', cse_request_url, params=querystring).text)
    return [item['link'] for item in results['items']]

# Monitor the file for changes
def wait_for_change(filename):
    last_modified = os.path.getmtime(filename)
    while True:
        new_modified = os.path.getmtime(filename)
        if new_modified != last_modified:
            last_modified = new_modified
            return True  # File has changed
        else:
            continue  # Wait and check again

if __name__ == "__main__":
    q = sys.argv[1]
    a = query_existing_data(q)
    if (a != "No existing match found"):
        print(a)
    else:
        print(a)
        print("Finding new match...")
        a = get_search_results(q)[0]
        print(a)
        requests.post("http://localhost:5000/request_open_tab", json={"url": a})
        wait_for_change("data.txt")
        a = query_existing_data(q)
        if (a != "No existing match found"):
            print(a)
        else:
            print(a)
            print("Sorry, couldnt find a match")