from flask import Flask, request
from flask_cors import CORS  # Import CORS to handle cross-origin requests
from flask import jsonify
import requests
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


script_dir = os.path.dirname(os.path.abspath(__file__))
data_file_path = os.path.join(script_dir, "data.txt")


urlList = []
data_dict = {}

def query_existing_data(question):
    if (not os.path.exists(data_file_path)):
        print("no data")
        return "No existing data found"
    with open(data_file_path, "r") as f:
        for line in f:
            key, value = line.split("|||")  # Split at the first occurrence of |||
            data_dict[key] = value  # Store in dictionary
            data_dict[value] = key  # Store in dictionary
    best_match = process.extractOne(question, list(data_dict.keys()))
    if (best_match and best_match[1] > 90):
        return data_dict[best_match[0]]
    else:
        return "No existing match found"

def get_search_results(question):
    querystring = {'cx': cse_cx, 'key': cse_key, 'q': question}
    results = json.loads(requests.request(
        'GET', cse_request_url, params=querystring).text)
    return [item['link'] for item in results['items']]

# Monitor the file for changes
def wait_for_change(filename):
    creating_new = False
    while not os.path.exists(filename):
        creating_new = True
        time.sleep(1)  # Check every 1 second
    last_modified = os.path.getmtime(filename)
    while True:
        new_modified = os.path.getmtime(filename)
        if (new_modified != last_modified or creating_new):
            last_modified = new_modified
            creating_new = False
            return True  # File has changed
        else:
            continue  # Wait and check again


app = Flask(__name__)

# Allow CORS for all domains (or specify a domain if needed)
CORS(app)


open_tab_request = False
tab_url = "https://google.com"

@app.route('/data', methods=['POST'])
def receive_data():
    
    try:
        # Parse the incoming JSON data
        data = request.get_json()
        print(data)

        if 'url' in data:
            if (str(data['url']).split("?")[0] not in urlList):
                urlList.append(str(data['url']).split("?")[0])
                print(urlList)
            else:
                return {'error': 'url already in list'}, 400
            
        # Check if the 'text' key is in the received JSON
        if 'text' in data:
            print(data)
            # Open the file in append mode
            with open(data_file_path, 'a') as file:
                # Write the received text followed by a newline
                file.write(str(data['text']).replace("<br>", "&&"))
                
            return {'status': 'success'}, 200
        else:
            return {'error': 'No text found in request'}, 400
    except Exception as e:
        return {'error': str(e)}, 500
    
    
@app.route('/request_open_tab', methods=['POST'])
def request_open_tab():
    global open_tab_request, tab_url  # Declare global usage
    data = request.get_json()
    
    if 'url' in data:
        tab_url = data['url']
    
    open_tab_request = True  # Set flag
    return jsonify({'status': 'success', 'message': 'Tab request registered'})
    

@app.route('/get_open_tab_request', methods=['GET'])
def get_open_tab_request():
    global open_tab_request, tab_url
    if open_tab_request:
        open_tab_request = False  # Reset flag after sending
        return jsonify({'open': True, 'url': tab_url})
    return jsonify({'open': False})


@app.route('/extension_query', methods=['POST'])
def extension_query():
    
    try:
        # Parse the incoming JSON data
        data = request.get_json()
        print(data["text"])
        q = data["text"]
        a = query_existing_data(q)
        if (a != "No existing match found" and a != "No existing data found"):
            print(a)
        else:
            print(a)
            print("Finding new match...")
            u = get_search_results(q)[0]
            requests.post("http://localhost:5000/request_open_tab", json={"url": u})
            wait_for_change(data_file_path)
            a = query_existing_data(q)
            if (a != "No existing match found"):
                print(a)
            else:
                print(a)
                print("Sorry, couldnt find a match")
        
        return jsonify({'message': a})

    except Exception as e:
        return {'error': str(e)}, 500



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Ensure it’s accessible on localhost
