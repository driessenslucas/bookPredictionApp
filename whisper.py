# # import requests
# # import base64

# # # Load the mp4
# # with open(
# #     "/home/lucas/Downloads/HLN haalt vergelijkingen vanonder het stof.mp4", "rb"
# # ) as f:
# #     video = f.read()


# # r = requests.post(
# #     url="http://0.0.0.0:7860/api/predict/",
# #     json={
# #         "data": [
# #             {
# #                 "data": base64.b64encode(video).decode("utf-8"),
# #                 "name": "world.mp4",
# #             }
# #         ]
# #     },
# # )

# # r.json()

# # print(r.json())


# # convert mp3 to wav
# import os
# from pydub import AudioSegment

# # convert mp3 to wav
# sound = AudioSegment.from_mp3("./hln.mp3")

# sound.export("./hln.wav", format="wav")

# ffmpeg -i ./hln.mp3 -acodec pcm_s16le -ac 1 -ar 16000 "./hln.wav"
