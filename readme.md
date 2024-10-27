# Bookify: A Flask Application for Book Management

## Overview

Bookify is a web application built using Flask that allows users to upload images of books, get recommendations based on their ratings, and manage their book collections. The application integrates with Firebase for user authentication and data storage, and OpenAI's API for image processing and rating predictions.

## Features

- **User Authentication**: Users can log in using Firebase authentication.
- **Image Processing**: Users can upload images of books, and the application uses OpenAI's API to extract book titles and predict ratings based on previous user ratings.
- **Book Management**: Users can view their search history, book ratings, and profile.
- **Search Functionality**: Users can search for books using the Google Books API.

## Getting Started

### Prerequisites

- Python 3.x
- Flask
- Firebase Admin SDK
- OpenAI SDK
- Google Books API

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/driessenslucas/bookPredictionApp.git ./bookify
   cd bookify
   ```

2. Install the required packages:
   ```bash
   pip install Flask firebase-admin openai langdetect requests pydantic
   ```

3. Set up your environment variables:
   - `FIREBASE_CREDENTIALS`: Path to your Firebase service account key file.
   - `OPENAI_API_KEY`: Your OpenAI API key.
   - `SECRET_KEY`: A secret key for session management.

### Running the Application

1. Start the Flask application:
   ```bash
   python app.py
   ```

2. Access the application in your web browser at `http://127.0.0.1:5000`.

## API Endpoints

### User Authentication
- **POST** `/login`: Authenticate user and set session.
- **GET** `/logout`: Log out the user and clear session.

### Book Management
- **GET** `/search-books`: Render the book search page.
- **POST** `/upload-books`: Upload an image of books to extract titles and information.
- **POST** `/upload-image`: Upload an image of a single book for processing.
- **GET** `/history`: Retrieve the user's history of processed requests.
- **GET** `/user-profile`: Display the user's profile.

### Book Search
- **GET** `/search-book`: Search for a specific book using the Google Books API.
- **GET** `/search`: Search for books using a query and language detection.

### Ratings
- **POST** `/rate`: Add a rating to a book.
- **POST** `/remove-rating`: Remove a rating from a book.

## Development Notes

### Firebase Setup

Make sure to replace the Firebase configuration file at `./static/bookify-f6b4b-firebase-adminsdk-wckno-636276de51.json` with your own credentials. Obtain your Firebase project credentials from the Firebase Console.

### OpenAI Configuration

Make sure to set your OpenAI API key as an environment variable to enable image processing features.

## Contributing

If you'd like to contribute to this project, please fork the repository and submit a pull request. 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Flask](https://flask.palletsprojects.com/) for the web framework.
- [Firebase](https://firebase.google.com/) for backend services.
- [OpenAI](https://openai.com/) for the GPT-4 Vision API.
- [Google Books API](https://developers.google.com/books) for book data
