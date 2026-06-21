# from google import genai
# from dotenv import load_dotenv
# import os

# load_dotenv()

# client = genai.Client(
#     api_key=os.getenv("GOOGLE_API_KEY")
# )

# models = client.models.list()

# for model in models:
#     print(model.name)


from dotenv import load_dotenv
from google import genai
import os

from streamlit import image

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)

prompt = """
A futuristic city at sunset with flying cars,
neon lights, and tall skyscrapers.
"""

response = client.models.generate_content(
    model="models/gemini-2.5-flash-image",
    contents=prompt
)

print(response)