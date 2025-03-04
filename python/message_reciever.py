from flask import Flask, request
from flask_cors import CORS  # Import CORS to handle cross-origin requests
from flask import jsonify
import requests

app = Flask(__name__)

# Allow CORS for all domains (or specify a domain if needed)
CORS(app)

urlList = []


open_tab_request = False
tab_url = "https://google.com"

@app.route('/data', methods=['POST'])
def receive_data():
    
    try:
        # Parse the incoming JSON data
        data = request.get_json()

        if 'url' in data:
            if (str(data['url']).split("?")[0] not in urlList):
                urlList.append(str(data['url']).split("?")[0])
                print(urlList)
            else:
                return {'error': 'url already in list'}, 400
            
        # Check if the 'text' key is in the received JSON
        if 'text' in data:
            # Open the file in append mode
            with open('python/data.txt', 'a') as file:
                # Write the received text followed by a newline
                file.write(str(data['text']).replace("<br>", "&&") + '\n')
                
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Ensure it’s accessible on localhost
