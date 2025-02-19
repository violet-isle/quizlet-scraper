from flask import Flask, request
from flask_cors import CORS  # Import CORS to handle cross-origin requests

app = Flask(__name__)

# Allow CORS for all domains (or specify a domain if needed)
CORS(app)

urlList = []

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
            with open('data.txt', 'a') as file:
                # Write the received text followed by a newline
                file.write(str(data['text']).replace("<br>", "&&") + '\n')
                
            return {'status': 'success'}, 200
        else:
            return {'error': 'No text found in request'}, 400
    except Exception as e:
        return {'error': str(e)}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Ensure it’s accessible on localhost
