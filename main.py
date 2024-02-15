from flask import Flask, request, jsonify, templating, session, url_for, redirect, render_template
import os
import openai
import base64
from datetime import datetime
import json
from datetime import timezone
from pydantic import BaseModel
from langdetect import detect
import requests
import firebase_admin
from firebase_admin import credentials,firestore

#get account key from os environment

cred = credentials.Certificate('./static/bookify-f6b4b-firebase-adminsdk-wckno-636276de51.json')
firebase_admin.initialize_app(cred, {
    'storageBucket': 'bookify-f6b4b.appspot.com'
})

db = firestore.client()

def process(image_path):
    user_id = session['user_id']

    # Fetch user ratings from Firestore
    user_ratings_ref = db.collection('user_ratings').where('user_id', '==', user_id)
    user_ratings = user_ratings_ref.stream()
    user_ratings_data = [{'title': doc.to_dict()['title'], 'rating': doc.to_dict()['rating']} for doc in user_ratings]

    # Fetch user's search history from Firestore, excluding certain fields
    user_requests_ref = db.collection('user_requests').where('user_id', '==', user_id)
    user_requests = user_requests_ref.stream()
    user_requests_data = [doc.to_dict() for doc in user_requests]
    for req_element in user_requests_data:
        req_element.pop('image_base64', None)
        req_element.pop('user_id', None)
        req_element.pop('timestamp', None)

    # Function to extract book titles and ratings remains unchanged
    def get_titles_and_ratings(books):
        return [(book["title"], book["rating"]) for book in books]

    titles_and_ratings = get_titles_and_ratings(user_ratings_data)

    # OpenAI and image processing part remains unchanged
    api_key = os.environ['OPENAI_API_KEY']
    openai.api_key = api_key
    base64_image = base64.b64encode(image_path.read()).decode('utf-8')

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            # Example of a previous user message
            {
                "role": "user",
                "content": f"these are my books and their ratings {titles_and_ratings}"},
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"can you get the titles of the books in this image? Based on the user's previous "
                                f"ratings, give the new book(s) a rating from 1-5. before rating, check if it has been rated before in the user's history. {user_requests_data}"
                                f"Provide reasons the user would like the books in less than 2 sentences, Address the user directly. Return in "
                                f"JSON, with these fields: 'book_title', 'predicted_rating', 'reason'. Give no other "
                                f"text.",
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

    response = openai.ChatCompletion.create(**payload)
    openai_response = response.choices[0].message['content']
    cleaned_response = openai_response.replace("```", "").strip().replace("json", "")
    
        # Attempt to parse the cleaned response
    try:
        parsed_response = json.loads(cleaned_response)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        parsed_response = {"error": "Failed to parse OpenAI response"}

    # Save to Firestore instead of MongoDB
    request_document = {
        "user_id": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "image_base64": f"data:image/jpeg;base64,{base64_image}",
        "openai_response": json.dumps(parsed_response),
    }
    db.collection('user_requests').add(request_document)

    return cleaned_response

app = Flask(__name__)
# allow file uploads
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif'}

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
    # return template
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
    session['user_id'] = data['uid']
    print(session['user_id'])
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Invalid username or password'})
    return jsonify({'success': True, 'message': 'Login Successful'})


@app.route('/logout')
def logout():
    # Clear session data
    session.clear()
    # Redirect to log in or home page
    print('logged out')
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


@app.route('/history')
def history():
    if 'user_id' not in session:
        return redirect(url_for('index'))
    return render_template('history.html')



@app.route('/search-history')
def search_history():
    user_id = session.get('user_id')
    
    # Firestore queries use '==' for equality
    user_requests_ref = db.collection('user_requests')
    query = user_requests_ref.where('user_id', '==', user_id)
    results = query.stream()
    
    user_requests_list = [doc.to_dict() for doc in results]

    # Assuming you want to return JSON data
    return jsonify(user_requests_list)



@app.route('/get-user-ratings', methods=['GET'])
def get_user_ratings():
    # Get current user
    user_id = session.get('user_id')
    
    # Query Firestore for documents in the `user_ratings` collection where `user_id` matches the provided value
    user_ratings_ref = db.collection('user_ratings')
    query_ref = user_ratings_ref.where('user_id', '==', user_id)
    user_ratings = query_ref.stream()
    
    # Convert query results to a list of dictionaries
    user_ratings_list = [doc.to_dict() for doc in user_ratings]
    
    print(user_ratings_list)
    # Return the results as JSON
    return jsonify(user_ratings_list)


@app.route('/upload-image', methods=['POST'])
def upload_image():
    # check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})
    file = request.files['file']

    response = process(file)

    print(response)

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
    except Exception as ex:
        return 'en'  # Default to 'en' if language detection fails


def parse_google_books_response(data):
    # This function should parse the JSON response from Google Books
    # and return a list of books in a JSON-compatible format.
    books = []
    for item in data.get('items', []):
        book_info = item.get('volumeInfo', {})
        books.append({
            'title': book_info.get('title'),
            'isbn': book_info.get('industryIdentifiers', [{}])[0].get('identifier'),
            # Assuming the first identifier is the ISBN
            'authors': book_info.get('authors', []),
            'publisher': book_info.get('publisher'),
            'publishedDate': book_info.get('publishedDate'),
            'description': book_info.get('description'),
            'thumbnail': book_info.get('imageLinks', {}).get('thumbnail'),
            'infoLink': book_info.get('infoLink')
        })
    return books


@app.route('/rate', methods=["POST"])
def book_rating():
    user_id = session.get('user_id')
    data = request.get_json()
    data['user_id'] = user_id

    try:
        # Add a new document to the 'user_ratings' collection
        doc_ref = db.collection('user_ratings').add(data)
        return jsonify({'success': True, 'message': 'Rating saved successfully', 'doc_id': doc_ref[1].id})
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred', 'details': str(e)}), 500
    
@app.route('/remove-rating', methods=["POST"])
def remove_book_rating():
    user_id = session.get('user_id')
    data = request.get_json()
    isbn = data.get('isbn')

    try:
        # Query for the document to delete
        docs = db.collection('user_ratings').where('user_id', '==', user_id).where('isbn', '==', isbn).stream()

        success = False
        for doc in docs:
            db.collection('user_ratings').document(doc.id).delete()
            success = True  # Assuming there's at least one document to delete

        if success:
            return jsonify({'success': True, 'message': 'Rating removed successfully'})
        else:
            return jsonify({'success': False, 'message': 'Rating not found or already deleted'})
    except Exception as e:
        return jsonify({'success': False, 'message': 'An error occurred', 'details': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
