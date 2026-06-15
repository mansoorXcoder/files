# from dotenv import load_dotenv
# from google import genai
# import os

# load_dotenv()

# client = genai.Client(
#     api_key=os.getenv("GOOGLE_API_KEY")
# )

# prompt = "Hello, world!"

# print("Input:", prompt)

# response = client.models.generate_content(
#     model="gemini-2.5-flash",
#     contents=prompt
# )

# print("Output:", response.text)

import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from ai_client import ask_ai

response = ask_ai("Hello, there I am Mansoor")

print(response)
with open("output.txt", "w", encoding="utf-8") as f:
    f.write(response)