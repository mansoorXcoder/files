from dotenv import load_dotenv
from google import genai
from error_handler import handle_error
import os
import time

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)

MODELS = [
    #"gemini-2.5-flash",
    "gemini-3.1-flash-lite",
    "gemma-4-31b",
    "gemma-4-26b",
    "gemini-2.5-flash-lite",
    "nano-banana-pro",
    "nano-banana-2",
    "gemini-3-pro-image"
]

def ask_ai(prompt):

    for model in MODELS:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )

            time.sleep(2)

            return response.text.strip()

        except Exception:
            continue

    return "All models failed."