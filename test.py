import openai
import base64
import os

# OpenAI and image processing part remains unchanged
api_key = ""
openai.api_key = api_key
base64_image = base64.b64encode(open("./images/image.png", "rb").read()).decode("utf-8")

payload = {
    "model": "gpt-4-vision-preview",
    "messages": [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "give all the titles of the books in the image, return in json format only, no other text. return these fields: title, author (and isbn if available.)"
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


print(cleaned_response)