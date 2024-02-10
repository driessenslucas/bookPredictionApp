from flask import Flask, request, jsonify, templating
import os
import openai
import base64
import json


def process(image_path):
  
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
  
  return response.choices[0].message['content']

app = Flask(__name__)
#allow file uploads
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['ALLOWED_EXTENSIONS'] = set(['png', 'jpg', 'jpeg', 'gif'])


@app.route('/')
def index():
  #return template
  return templating.render_template('index.html')

@app.route('/upload-image', methods=['POST'])
def upload_image():
  # check if the post request has the file part
  if 'file' not in request.files:
    return jsonify({'error': 'No file part'})
  file = request.files['file']
  # pass the file to the process function
  response = process(file)
  response = json.loads(response)
  return jsonify({'response': response})

if __name__ == '__main__':
    app.run(debug=True)
