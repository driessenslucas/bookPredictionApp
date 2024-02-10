from flask import Flask, request, jsonify, templating, session, url_for
import os
import openai
import base64
from datetime import datetime
import json
from pymongo import MongoClient
from bson.json_util import dumps

# Assuming MongoDB service is named 'mongo' in your docker-compose and the database name is 'your_database_name'
mongo_user = os.environ.get('MONGO_INITDB_ROOT_USERNAME', 'root')
mongo_pass = os.environ.get('MONGO_INITDB_ROOT_PASSWORD', 'root123')
client = MongoClient(f'mongodb://mongo:27017/',
                     username=mongo_user,
                     password=mongo_pass)
db = client['book_app']
collection = db['user_requests']


def process(image_path, user_id='1'):
  
  books = [
    "The Secret History",
    "A little life",
    "Book of night",
    "Cruel Prince",
    "Babel",
    "Normal People",
    "Happy Place"
  ]
  ratings = [
  5, 5, 2, 1, 5, 3, 4
  ]

  #get api from env 
  api_key = os.environ['OPENAI_API_KEY']
  
  openai.api_key = api_key

  base64_image = base64.b64encode(image_path.read()).decode('utf-8')


  payload = {
    "model": "gpt-4-vision-preview",
    "messages": [
      # Example of a previous user message
      {"role": "user", "content": f"these are my books and their ratings {books}, {ratings}"},
      # Assuming you can structure an image upload or reference in a compatible way
      {
      "role": "user",
        "content": [
          {
            "type": "text",
            "text": "can you get the titles of the books in this image? Based on the user's previous ratings, give the new book(s) a rating from 1-5. \
            Please provide reasons for your prediction in less than 2 sentences json format, with these fields 'book_title' 'predicted_rating' 'reason'. give no other text."
          },
          {
            "type": "image_url",
            "image_url": {
              "url": f"data:image/jpeg;base64,{base64_image}"
            }
          }
        ]
      }
    ],
    "max_tokens": 350,
  }

  #create response from payload
  response = openai.ChatCompletion.create(**payload)
  print(response.choices[0].message['content'])
  
  #mogno
  base64_image = f"data:image/jpeg;base64,{base64_image}"
  # Assume the rest of your process function is here and generates a `response`

  # Now, save to MongoDB
  request_document = {
      "user_id": user_id,
      "timestamp": datetime.utcnow().isoformat(),
      "image_base64": base64_image,
      "openai_response": response.choices[0].message['content']
  }

  collection.insert_one(request_document)
  
  return response.choices[0].message['content']

app = Flask(__name__)
#allow file uploads
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = set(['png', 'jpg', 'jpeg', 'gif'])

app.secret_key = os.environ.get('SECRET_KEY', 'dev')


@app.route('/')
def index():
  #return template
  return templating.render_template('index.html')

@app.route('/user-profile')
def user_profile():
  # Do some processing here if needed
  
  return templating.render_template('profile.html')  # Assuming 'profile.html' is under the 'templates' directory
  

@app.route('/redirect-to-home')
def redirect_to_home():
  # This will redirect to the view function named 'home'
  return templating.render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
  # Get the user_id from the request
  user_id = request.form.get('user_id')
  # Set the user_id in the session
  session['user_id'] = user_id
  # Redirect to the home page
  return templating.render_template('index.html')

@app.route('/logout')
def logout():
  # Clear session data
  session.clear()
  # Redirect to login or home page
  return templating.render_template('index.html')

  


@app.route('/get-user-data/<user_id>', methods=['GET'])
def get_user_data(user_id):
    # Convert user_id to the correct type if necessary (e.g., int or string)
    user_id_query = int(user_id) if user_id.isdigit() else user_id

    # Query the collection for documents where `user_id` matches the provided value
    user_requests = collection.find({'user_id': user_id_query})

    # Convert the query result to a list and then serialize to JSON
    user_requests_json = dumps(list(user_requests))
    
    return user_requests_json


@app.route('/upload-image', methods=['POST'])
def upload_image():
  # check if the post request has the file part
  if 'file' not in request.files:
    return jsonify({'error': 'No file part'})
  file = request.files['file']
  # pass the file to the process function
  user_id = session.get('user_id', '1')
  response = process(file, user_id)
  # response = process(file)
  response = json.loads(response)
  return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
