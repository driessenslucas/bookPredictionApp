from flask import (
    Flask,
    request,
    jsonify,
    templating,
    session,
    url_for,
    redirect,
    render_template,
)
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
from firebase_admin import credentials, firestore


"""
    setting firebase credentials
    
    Obtain your Firebase project credentials and replace the Firebase configuration file at 
    ./static/bookify-f6b4b-firebase-adminsdk-wckno-636276de51.json."""

# get environment variable for firebase credentials


firebase_creds = os.environ.get("FIREBASE_CREDENTIALS")
print(firebase_creds)

cred = credentials.Certificate(os.environ.get("FIREBASE_CREDENTIALS"))
firebase_admin.initialize_app(cred, {"storageBucket": "bookify-f6b4b.appspot.com"})

db = firestore.client()


def process_single_request(image_path):
    """
    Process a single request. This is the entry point for the application. It fetches data from Firestore and user's search history.

    @param image_path - Path to the image that is to be processed.

    @return A dictionary containing the results of the processing. The keys of the dictionary are the same as the keys in the database
    """
    user_id = session["user_id"]

    # Fetch user ratings from Firestore
    user_ratings_ref = db.collection("user_ratings").where("user_id", "==", user_id)
    user_ratings = user_ratings_ref.stream()
    user_ratings_data = [
        {"title": doc.to_dict()["title"], "rating": doc.to_dict()["rating"]}
        for doc in user_ratings
    ]

    # Fetch user's search history from Firestore, excluding certain fields
    user_requests_ref = db.collection("user_requests").where("user_id", "==", user_id)
    user_requests = user_requests_ref.stream()
    user_requests_data = [doc.to_dict() for doc in user_requests]
    # Remove image_base64 image_base64 user_id user_id and timestamp from the user_requests_data.
    for req_element in user_requests_data:
        req_element.pop("image_base64", None)
        req_element.pop("user_id", None)
        req_element.pop("timestamp", None)

    def get_titles_and_ratings(books):
        """
        Get a list of title and rating tuples from books. This is used to generate an API response for the Books API

        @param books - A list of books returned from the API

        @return A list of tuples ( title rating ) for each
        """
        return [(book["title"], book["rating"]) for book in books]

    titles_and_ratings = get_titles_and_ratings(user_ratings_data)

    # Get openai api key from environment variable
    api_key = os.environ["OPENAI_API_KEY"]
    openai.api_key = api_key
    # Convert the image to base64 to allow it to be sent to OpenAI
    base64_image = base64.b64encode(image_path.read()).decode("utf-8")

    # Create the payload to send to OpenAI
    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": f"these are my books and their ratings {titles_and_ratings}",
            },
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": f"can you get the titles of the books in this image? Based on the user's previous "
                        f"ratings, give the new book(s) a rating from 1-5. before rating be critical, check if it has "
                        f"been rated before in the user's history. {user_requests_data}"
                        f"Provide reasons the user would like the books in less than 2 sentences, Address the user directly. Return in "
                        f"JSON, with these fields: 'book_title', 'predicted_rating', 'reason'. Give no other "
                        f"text.",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            },
        ],
        "max_tokens": 350,
    }

    """
        Process the request using OpenAI's API. The response is then parsed and saved to Firestore.
        
        The process is cleaned by removing the "```json ```" markdown tag from the response to allow it to be parsed by the json module.
        
    """
    response = openai.ChatCompletion.create(**payload)
    openai_response = response.choices[0].message["content"]
    cleaned_response = openai_response.replace("```", "").strip().replace("json", "")

    # Try to parse the response as JSON. If it fails, return an error message
    try:
        parsed_response = json.loads(cleaned_response)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        parsed_response = {"error": "Failed to parse OpenAI response"}

    # Save the whole request to Firestore
    request_document = {
        "user_id": user_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "image_base64": f"data:image/jpeg;base64,{base64_image}",
        "openai_response": json.dumps(parsed_response),
    }
    db.collection("user_requests").add(request_document)

    return cleaned_response


def process_books(image_path):
    """
    Process books in the image and return their titles, authors, and ISBNs if found. It uses OpenAI's API.

    @param image_path - Path to the image to process.

    @return Tuple of ( book title author isbn ) for the book
    """
    # Get openai api key from environment variable
    api_key = os.environ["OPENAI_API_KEY"]
    openai.api_key = api_key
    # Convert the image to base64 to allow it to be sent to OpenAI
    base64_image = base64.b64encode(image_path.read()).decode("utf-8")

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "give all the titles of the books in the image, return in json format only, no other "
                        "text. return these fields: title, author (and isbn if available.)",
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                    },
                ],
            }
        ],
        "max_tokens": 350,
    }

    """
        Process the request using OpenAI's API. The response is then parsed and saved to Firestore.
        
        The process is cleaned by removing the "```json ```" markdown tag from the response to allow it to be parsed 
        by the json module.
        
    """
    response = openai.ChatCompletion.create(**payload)
    openai_response = response.choices[0].message["content"]
    cleaned_response = openai_response.replace("```", "").strip().replace("json", "")

    # print(cleaned_response)
    return cleaned_response


app = Flask(__name__)
# allow file uploads
app.config["UPLOAD_FOLDER"] = "uploads"
app.config["ALLOWED_EXTENSIONS"] = {"png", "jpg", "jpeg", "gif"}

app.secret_key = os.environ.get("SECRET_KEY", "dev")

AppHasRunBefore = False


@app.before_request
def before_request():
    """
    Clear session before request. This is called by app. run () to ensure that session is cleared
    """
    global AppHasRunBefore
    # Clear the session and clear the session
    if not AppHasRunBefore:
        AppHasRunBefore = True
        session.clear()


class RatingData(BaseModel):
    book_title: str
    rating: int


@app.route("/")
def index():
    """
    The index page of the web application. This is used to display the home page of the web application.


    @return The template that renders the index page of the web
    """
    # return template
    return templating.render_template("index.html")


@app.route("/redirect-to-home")
def redirect_to_home():
    """
    Redirect to the home page. This is a template function that will be called when the user clicks the home link in the home page.


    @return A string containing the HTML to be rendered as the template
    """
    # This will redirect to the view function named 'home'
    return templating.render_template("index.html")


@app.route("/main")
def main():
    """
    Main function to display prediction page. Checks if user_id is in session. If not redirects to index page.


    @return Response to application or redirect to index page if user_id is
    """
    # If user_id is not in session redirect to index page.
    if "user_id" not in session:
        return redirect(url_for("index"))
    return render_template("prediction.html")


@app.route("/login", methods=["POST"])
def login():
    """
    Set the user_id in the session. This is a template function that will be called when after the firebase login is successful.


    @return JSON with success / failure of login or error message
    """
    data = request.get_json()  # Get data as JSON
    session["user_id"] = data["uid"]
    print(session["user_id"])
    # If user_id is not in session return json with success False message Invalid username or password
    if "user_id" not in session:
        return jsonify({"success": False, "message": "Invalid username or password"})
    return jsonify({"success": True, "message": "Login Successful"})


@app.route("/logout")
def logout():
    """
    Logs out the user and redirects to home page. Clears session data so it can be used in subsequent requests.


    @return Template to render login page with data to be logged
    """
    # Clear session data
    session.clear()
    # Redirect to log in or home page
    print("logged out")
    return templating.render_template("index.html")


@app.route("/user-profile")
def user_profile():
    """
    Display the user's profile. This is a template for the user profile page.


    @return The template to render the user's profile or redirect to the index
    """
    # If user_id is not in session redirect to index page.
    if "user_id" not in session:
        return redirect(url_for("index"))

    return templating.render_template(
        "profile.html"
    )  # Assuming 'search.html' is under the 'templates' directory


@app.route("/search-books")
def search_books():
    """
    Search books by user. This is a view to be used in conjunction with search_books_by_user.


    @return The template that renders the search page and redirects to the index
    """
    # If user_id is not in session redirect to index page.
    if "user_id" not in session:
        return redirect(url_for("index"))
    return render_template("search.html")


@app.route("/history")
def history():
    """
    Displays the user's history. This is a view to allow the user to navigate to the last page of the application that was viewed.


    @return The template that renders the history page or redirects to the index
    """
    # If user_id is not in session redirect to index page.
    if "user_id" not in session:
        return redirect(url_for("index"))
    return render_template("history.html")


@app.route("/search-history")
def search_history():
    """
    Search history for a user. This is a GET request that will return a list of user_requests that belong to the user with the given user_id.


    @return JSON data that can be sent to the client as
    """
    user_id = session.get("user_id")

    # Firestore queries use '==' for equality
    user_requests_ref = db.collection("user_requests")
    query = user_requests_ref.where("user_id", "==", user_id)
    results = query.stream()

    user_requests_list = [doc.to_dict() for doc in results]

    # Assuming you want to return JSON data
    return jsonify(user_requests_list)


@app.route("/get-user-ratings", methods=["GET"])
def get_user_ratings():
    """
    Get user ratings based on user_id from Firestore and convert to JSON


    @return List of dictionaries with rating data for the current user
    """
    # Get current user
    user_id = session.get("user_id")

    # Query Firestore for documents in the `user_ratings` collection where `user_id` matches the provided value
    user_ratings_ref = db.collection("user_ratings")
    query_ref = user_ratings_ref.where("user_id", "==", user_id)
    user_ratings = query_ref.stream()

    # Convert query results to a list of dictionaries
    user_ratings_list = [doc.to_dict() for doc in user_ratings]

    print(user_ratings_list)
    # Return the results as JSON
    return jsonify(user_ratings_list)


@app.route("/upload-books", methods=["POST"])
def upload_books():
    """
    Uploads an image of books so it can be processed by the function process_books.

    process_books is a function that processes the image and returns the titles, authors, and ISBNs of the books in the image.

    @return JSON with response to the request. If there is an error the error is returned
    """
    # check if the post request has the file part
    # Return a JSON response with error if file is not in request. files
    if "file" not in request.files:
        return jsonify({"error": "No file part"})
    file = request.files["file"]

    response = process_books(file)

    print(response)

    return jsonify({"response": response})


@app.route("/upload-image", methods=["POST"])
def upload_image():
    """
    Uploads an image of a single book so it can be processed by the function process_single_request.

    process_single_request is a function that processes the book and will try to predict the rating of the book based on the user's previous ratings.

    @return JSON with the response of the upload. If there is an error the error is returned
    """

    # check if the post request has the file part
    # Return a JSON response with error if file is not in request. files
    if "file" not in request.files:
        return jsonify({"error": "No file part"})
    file = request.files["file"]

    response = process_single_request(file)

    print(response)

    return jsonify({"response": response})


@app.route("/fetch-image", methods=["POST"])
def fetch_image():
    """
    This is used to 'download' images from the internet and return them as base64 encoded strings.


    @return json with success and
    """
    image_url = request.json["url"]
    response = requests.get(image_url, stream=True)

    # Returns a JSON object with success True image
    if response.status_code == 200:
        base64_image = base64.b64encode(response.content).decode("utf-8")
        return jsonify({"success": True, "image": base64_image})
    else:
        return jsonify({"success": False, "message": "Failed to fetch image"})


@app.route("/search-book", methods=["get"])
def search_book():
    """
    Search for a book in the google books API. This is a REST call to the API and returns a list of books that match the query.


    @return JSON with book information or error message if something goes
    """
    query = request.args.get("query", "")
    url = f"https://www.googleapis.com/books/v1/volumes?q={query}&langRestrict=en"

    try:
        response = requests.get(url)
        response.raise_for_status()  # Will raise an HTTPError for bad requests (4XX or 5XX)

        # The response is already in JSON, so you can directly return it or process it as needed
        books_data = response.json()
        books = parse_google_books_response(books_data)

        return jsonify(books[0])

    except requests.exceptions.HTTPError as err:
        return jsonify({"error": "API request unsuccessful", "details": str(err)})
    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)})


@app.route("/search", methods=["GET"])
def search():
    """
    Search Google books by query. This is a REST call to the API and returns a list of books that match the query.


    @return JSON response or error message if something goes wrong with
    """
    query = request.args.get("query", "")
    # Used to detect langueges in a string. For example, you might use 'en' for English, 'fr' for French, etc.
    language = detect_language(query)

    # Append the language restrict query parameter
    url = (
        f"https://www.googleapis.com/books/v1/volumes?q={query}&langRestrict={language}"
    )

    try:
        response = requests.get(url)
        response.raise_for_status()  # Will raise an HTTPError for bad requests (4XX or 5XX)

        books_data = response.json()
        books = parse_google_books_response(books_data)

        return jsonify(books)

    except requests.exceptions.HTTPError as err:
        return jsonify({"error": "API request unsuccessful", "details": str(err)}), 500
    except Exception as e:
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


def detect_language(query):
    """
    Detect language of query. This is a wrapper around detect ( query ) and if it fails it will default to 'en' (English).

    @param query - query to detect language of

    @return language of query or'en'if not recogn
    """
    try:
        return detect(query)
    except Exception as ex:
        return "en"  # Default to 'en' if language detection fails


def parse_google_books_response(data):
    """
    Parse the response from Google Books and return a list of books.

    @param data - JSON response from Google Books. Must contain items

    @return List of dicts with book
    """
    # This function parses the JSON response from Google Books
    # and return a list of books in a JSON-compatible format.
    books = []
    # This method will add the books to the list of books
    for item in data.get("items", []):
        book_info = item.get("volumeInfo", {})
        books.append(
            {
                "title": book_info.get("title"),
                # get the first identifier in the list of industryIdentifiers
                "isbn": book_info.get("industryIdentifiers", [{}])[0].get("identifier"),
                "authors": book_info.get("authors", []),
                "publisher": book_info.get("publisher"),
                "publishedDate": book_info.get("publishedDate"),
                "description": book_info.get("description"),
                "thumbnail": book_info.get("imageLinks", {}).get("thumbnail"),
                "infoLink": book_info.get("infoLink"),
            }
        )
    return books


@app.route("/rate", methods=["POST"])
def book_rating():
    """
    Add a rating to the user_ratings collection.

    @return Success or failure of the request
    """
    user_id = session.get("user_id")
    data = request.get_json()
    data["user_id"] = user_id

    try:
        # Add a new document to the 'user_ratings' collection
        doc_ref = db.collection("user_ratings").add(data)
        return jsonify(
            {
                "success": True,
                "message": "Rating saved successfully",
                "doc_id": doc_ref[1].id,
            }
        )
    except Exception as e:
        return (
            jsonify(
                {"success": False, "message": "An error occurred", "details": str(e)}
            ),
            500,
        )


@app.route("/remove-rating", methods=["POST"])
def remove_book_rating():
    """
    Remove rating from user's ratings.


    @return JSON with success or failure of the request
    """
    user_id = session.get("user_id")
    data = request.get_json()
    isbn = data.get("isbn")

    try:
        # Query for the document to delete
        docs = (
            db.collection("user_ratings")
            .where("user_id", "==", user_id)
            .where("isbn", "==", isbn)
            .stream()
        )

        success = False
        # Delete all users ratings documents.
        for doc in docs:
            db.collection("user_ratings").document(doc.id).delete()
            success = True  # Assuming there's at least one document to delete

        # Returns a JSON response with success True if rating was successfully removed successfully or not
        if success:
            return jsonify({"success": True, "message": "Rating removed successfully"})
        else:
            return jsonify(
                {"success": False, "message": "Rating not found or already deleted"}
            )
    except Exception as e:
        return (
            jsonify(
                {"success": False, "message": "An error occurred", "details": str(e)}
            ),
            500,
        )


if __name__ == "__main__":
    app.run(debug=True)
