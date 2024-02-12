from flask import Flask, request, jsonify, templating, session, url_for, redirect, render_template
import os
import openai
import base64
from datetime import datetime
import json
from bson import ObjectId
from pymongo import MongoClient
from bson.json_util import dumps
from pydantic import BaseModel
from langdetect import detect
import requests



mongo_user = os.environ.get('MONGO_INITDB_ROOT_USERNAME', 'root')
mongo_pass = os.environ.get('MONGO_INITDB_ROOT_PASSWORD', 'root123')
client = MongoClient(f'mongodb://mongo:27017/',
                     username=mongo_user,
                     password=mongo_pass)
db = client['book_app']
collection = db['user_requests']
users_collection = db['users']
user_ratings_collection = db['user_ratings']


def process(image_path, user_id='1'):
  
  # books = [
  #   "The Secret History",
  #   "A little life",
  #   "Book of night",
  #   "Cruel Prince",
  #   "Babel",
  #   "Normal People",
  #   "Happy Place"
  # ]
  # ratings = [
  # 5, 5, 2, 1, 5, 3, 4
  # ]
  
  #get books and ratings from user
  user_id = session['user_id']
    # Query the collection for documents where `user_id` matches the provided value
  user_ratings = user_ratings_collection.find({'user_id': user_id})

  # Convert the query result to a list and then serialize to JSON
  user_ratings_json = dumps(list(user_ratings))
  
  # Given data
  books_data = [
      {
          "_id": "65c9d7f8c272b188e606d6d6",
          "isbn": "9781509807864",
          "title": "The Nix",
          "rating": "5",
          "user_id": "65c9d7a39e65758eb341640f"
      }
  ]

  # Function to extract book titles and ratings
  def get_titles_and_ratings(books):
      return [(book["title"], book["rating"]) for book in books]

  # Test the function with the provided data
  titles_and_ratings = get_titles_and_ratings(books_data)
  
  

  #get api from env 
  api_key = os.environ['OPENAI_API_KEY']
  
  openai.api_key = api_key

  base64_image = base64.b64encode(image_path.read()).decode('utf-8')


  payload = {
    "model": "gpt-4-vision-preview",
    "messages": [
      # Example of a previous user message
      {"role": "user", "content": f"these are my books and their ratings {titles_and_ratings}"},
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


# do something before the first request is processed
AppHasRunBefore = False

@app.before_request
def before_request():
  global AppHasRunBefore
  if not AppHasRunBefore:
    # do something here
    AppHasRunBefore = True
    print('App has run before')
    session.clear()
    

# Pydantic model for the rating data
class RatingData(BaseModel):
    book_title: str
    rating: int

@app.route('/')
def index():
  #return template
  return templating.render_template('index.html')

@app.route('/user-profile')
def user_profile():
  # Do some processing here if needed
  if 'user_id' not in session:
    return redirect(url_for('index'))
  
  return templating.render_template('profile.html')  # Assuming 'search.html' is under the 'templates' directory
  

@app.route('/redirect-to-home')
def redirect_to_home():
  # This will redirect to the view function named 'home'
  return templating.render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
  data = request.get_json()  # Get data as JSON
  username = data.get('username')
  password = data.get('password')

  # Assuming users_collection is your MongoDB collection for users
  user = users_collection.find_one({'username': username})

  print(user)
  print(username)
  print(password)
  
  if user and user['password'] == password:  # Reminder: Hash passwords in a real application
    session['user_id'] = str(user['_id'])  # Use the MongoDB ID as the session identifier
    return jsonify({'success': True, 'message': 'Login Successful'})
  else:
    return jsonify({'success': False, 'message': 'Invalid username or password'})

@app.route('/logout')
def logout():
  # Clear session data
  session.clear()
  # Redirect to login or home page
  return templating.render_template('index.html')

@app.route('/main')
def main():
  if 'user_id' not in session:
      return redirect(url_for('index'))
  return render_template('prediction.html')

@app.route('/search-books')
def search_books():
  if 'user_id' not in session:
      return redirect(url_for('index'))
  return render_template('search.html')

@app.route('/get-user-data', methods=['GET'])
def get_user_data():
  # Convert user_id to the correct type if necessary (e.g., int or string)
  user_id = session.get('user_id')
  user_id_query = int(user_id) if user_id.isdigit() else user_id

  # Query the collection for documents where `user_id` matches the provided value
  user_requests = collection.find({'user_id': user_id_query})

  # Convert the query result to a list and then serialize to JSON
  user_requests_json = dumps(list(user_requests))
  
  return user_requests_json

@app.route('/history')
def history():
  if 'user_id' not in session:
      return redirect(url_for('index'))
  return render_template('history.html')

@app.route('/get-user-ratings', methods=['GET'])
def get_user_ratings():
  #get current user
  user_id = session.get('user_id')
  # Query the collection for documents where `user_id` matches the provided value
  user_ratings = user_ratings_collection.find({'user_id': user_id})

  # Convert the query result to a list and then serialize to JSON
  user_ratings_json = dumps(list(user_ratings))
  
  return user_ratings_json

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



@app.route('/search', methods=['GET'])
def search():
    query = request.args.get('query', '')
    # Assume you have a function to detect language from the query
    # For example, you might use 'en' for English, 'fr' for French, etc.
    language = detect_language(query)
    
    # Append the language restrict query parameter
    url = f'https://www.googleapis.com/books/v1/volumes?q={query}&langRestrict={language}'

    try:
        response = requests.get(url)
        response.raise_for_status()  # Will raise an HTTPError for bad requests (4XX or 5XX)
        
        # The response is already in JSON, so you can directly return it or process it as needed
        books_data = response.json()
        books = parse_google_books_response(books_data)

        return jsonify(books)

    except requests.exceptions.HTTPError as err:
        return jsonify({'error': 'API request unsuccessful', 'details': str(err)}), 500
    except Exception as e:
        return jsonify({'error': 'An error occurred', 'details': str(e)}), 500

def detect_language(query):
    try:
        return detect(query)
    except Exception as e:
        return 'en'  # Default to 'en' if language detection fails


def parse_google_books_response(data):
    # This function should parse the JSON response from Google Books
    # and return a list of books in a JSON-compatible format.
    books = []
    for item in data.get('items', []):
        book_info = item.get('volumeInfo', {})
        books.append({
            'title': book_info.get('title'),
            'isbn': book_info.get('industryIdentifiers', [{}])[0].get('identifier'),  # Assuming the first identifier is the ISBN
            'authors': book_info.get('authors', []),
            'publisher': book_info.get('publisher'),
            'publishedDate': book_info.get('publishedDate'),
            'description': book_info.get('description'),
            'thumbnail': book_info.get('imageLinks', {}).get('thumbnail'),
            'infoLink': book_info.get('infoLink')
        })
    return books
  
#save rating book 
@app.route('/rate', methods=["post"])
def book_rating():
  #get current user
  user_id = session.get('user_id')
  #get data from post request
  data = request.get_json()
  #save data to database
  #link user_id to rating
  data['user_id'] = user_id
  
  print(data)
  try:
    user_ratings_collection.insert_one(data)
  #return success message
    return jsonify({'success': True, 'message': 'Rating saved successfully'})
  except Exception as e:
    return jsonify({'success': False, 'message': 'An error occurred', 'details': str(e)}), 500
  

@app.route('/remove-rating', methods=["POST"])
def remove_book_rating():
    user_id = session.get('user_id')
    data = request.get_json()
    isbn = data.get('isbn')
    
    print(isbn)
    print(user_id)
    print(data)
    
    user_id_query = int(user_id) if user_id.isdigit() else user_id
    try:
        result = user_ratings_collection.delete_one({
            'user_id': user_id_query, # Make sure to convert user_id to ObjectId
            'isbn': isbn
        })
        if result.deleted_count > 0:
            return jsonify({'success': True, 'message': 'Rating removed successfully'})
        else:
            return jsonify({'success': False, 'message': 'Rating not found or already deleted'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
    #clear session data
