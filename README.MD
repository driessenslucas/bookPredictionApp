# Book Recommendation Web Application

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

## Project Overview
This project aims to develop a dynamic web application that provides personalized book recommendations to users. Leveraging Flask, MongoDB, and OpenAI's powerful AI models, the application offers an innovative approach to discover books based on user preferences and ratings. Users can upload images of books, and the application, through AI analysis, recommends new books with predicted ratings and reasons why the user might enjoy them. This project not only showcases the integration of web development and AI technologies but also enhances the user experience by making book discovery personalized and interactive.

## Key Features
- **User Profile Management:** Utilizes MongoDB for storing user information, including book ratings and preferences, to provide a tailored experience.
- **Image Processing for Book Recommendations:** Users can upload book images, which are then processed using OpenAI's API to identify titles and suggest similar books with predicted ratings.
- **Dynamic Web Interface:** Built with Flask, the application offers a seamless and interactive user interface for uploading images, viewing recommendations, and managing profiles.
- **Personalized Book Ratings:** Incorporates user ratings from past interactions to refine future recommendations, ensuring suggestions become more accurate over time.
- **Secure User Authentication:** Implements session-based user authentication to protect access and ensure data privacy.

## Technologies Used
- **Flask:** For creating the web application's backend and API endpoints.
- **MongoDB:** To manage user data, book ratings, and recommendations, enabling real-time data access and storage.
- **OpenAI API:** Leverages AI to analyze book images and generate recommendations based on textual and visual data.
- **JavaScript and HTML/CSS:** For developing the frontend, ensuring a dynamic and responsive user interface.
- **Docker** For deployment 

## Challenges and Solutions
- **Integrating AI for Image Processing:** The challenge of accurately extracting book titles from images was addressed by utilizing OpenAI's advanced model, which interprets image content and matches it with user preferences.
- **User Data Management:** MongoDB was chosen for its flexibility in handling diverse data types and its scalability, allowing for efficient user data management and real-time updates.
- **User Experience Design:** Focused on creating an intuitive and engaging interface that simplifies the process of finding and rating books, enhancing user interaction and satisfaction.

## Future Enhancements
- **Enhanced Recommendation Algorithms:** To further improve recommendation accuracy by incorporating more nuanced user feedback and AI analysis.
- **Social Features:** Introducing social elements where users can share and discuss their book recommendations with friends or public communities.
- **Multi-Language Support:** Expanding the application's reach by adding support for multiple languages, making it accessible to a wider audience.

## Conclusion
This book recommendation web application stands at the intersection of web development and AI, offering a unique solution to personalized book discovery. It exemplifies how technology can transform traditional media consumption, making it more interactive, personalized, and enjoyable. As the project evolves, it aims to become an essential tool for book lovers and readers seeking to explore new titles aligned with their tastes and preferences.

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
