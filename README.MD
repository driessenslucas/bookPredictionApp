# Bookify Flask Application

Bookify is a Flask-based web application designed to manage book information, including user ratings, search history, and book recommendations using OpenAI's GPT-4 API. Users can upload images of books to receive predictions on book titles, authors, and potential ratings based on their past preferences.

## Features

- User authentication and session management
- Upload book images for title and author recognition
- Rate books and manage ratings
- View user-specific search history and ratings
- Fetch book information using Google Books API
- Utilize OpenAI's GPT-4 API for book recommendations and information extraction

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Python 3.6+
- Flask
- Firebase account and Firestore database
- OpenAI API key

## Setting Up

1. **Clone the repository**

```bash
git clone https://yourrepositorylink.git
cd your-project-folder
```

2. **Install dependencies**

```bash
pip install -r requirements.txt
```

3. **Configure Firebase**

   - Obtain your Firebase project credentials and replace the Firebase configuration file at `./static/bookify-f6b4b-firebase-adminsdk-wckno-636276de51.json`.

4. **Set environment variables**

Set the following environment variables:

- `OPENAI_API_KEY`: Your OpenAI API key.
- `SECRET_KEY`: A secret key for Flask application.
- Firebase related environment variables if any.

You can set them using a `.env` file or export them directly into your environment.

5. **Initialize Firebase Admin SDK**

Ensure that Firebase Admin SDK is correctly initialized with your project's credentials as shown in the application.

## Running the Application

To run the application locally, execute the following command:

```bash
docker-compose up
```

The application will start running on [http://localhost:8500](http://localhost:8500)

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

Distributed under the MIT License. See `LICENSE` for more information.
