from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)

prompt = "Hello, world!"

print("Input:", prompt)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt
)

print("Output:", response.text)




# from dotenv import load_dotenv
# from google import genai
# import os

# load_dotenv()

# client = genai.Client(
#     api_key=os.getenv("GOOGLE_API_KEY")
# )

# response = client.models.generate_content(
#     model="gemini-2.5-flash",
#     contents="Hello, world!"
# )

# print(response.text)