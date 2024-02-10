# Book Recommendation System

This Flask application accepts image uploads and uses OpenAI's GPT-4 Vision model to predict book titles from images, rate them based on previous user ratings, and provide reasoning for the ratings in a concise format.

## Author

**Lucas Driessens**  
Institution: Howest University of Applied Sciences  
Date: 2024-10-02

## Features

- Image upload via a simple web form.
- Processing images to extract book titles using OpenAI's GPT-4 Vision model.
- Predictive rating based on historical data with reasoning.

### Upcoming Features

- [ ] Profiles for users to store their ratings and preferences.
- [ ] A history of previous ratings and recommendations.
- [ ] A custom Recommendation System based on user ratings and preferences.

## Prerequisites

- Docker and Docker Compose installed on your system.
- An OpenAI API key.

## Setup and Running with Docker

1. **Clone the Repository**

   First, clone this repository to your local machine using:

   ```
   git https://github.com/driessenslucas/bookPredictionApp
   cd bookPredictionApp
   ```

2. **Configure API Key**

   Before running the application, you need to set your OpenAI API key. Create a `.env` file in the project root directory and add your OpenAI API key as follows:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   Replace `your_openai_api_key_here` with your actual OpenAI API key.

3. **Build and Run with Docker Compose**

   Use Docker Compose to build and run the application:

   ```
   docker-compose up --build
   ```

   This command builds the Docker image and starts the container. The application will be accessible at `http://localhost:8500`.

## Usage

- Navigate to `http://localhost:8500` in your web browser to access the application.
- Use the provided form to upload an image containing book titles.
- Submit the form, and the application will process the image, predict titles, rate them, and provide reasoning based on previous user ratings.

## Development

For local development, you can mount the application directory inside the Docker container to reflect changes in real-time without rebuilding the image. This setup is already configured in the `docker-compose.yml` file.

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

Ensure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
