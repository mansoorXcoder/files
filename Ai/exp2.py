from dotenv import load_dotenv
from google import genai
import os

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GOOGLE_API_KEY")
)

# Baseline Prompt
baseline_prompt = "Write a one-paragraph bio of Ada Lovelace."

# Enhanced Prompt
enhanced_prompt = """
You are a professional historian.

Write a one-paragraph biography of Ada Lovelace.

Requirements:
- 120-150 words
- Mention her collaboration with Charles Babbage
- Explain why she is considered the first computer programmer
- Use an academic yet easy-to-read style
- Output exactly one paragraph
"""

print("=" * 60)
print("BASELINE PROMPT")
print("=" * 60)

baseline_response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=baseline_prompt
)

print(baseline_response.text)

print("\n" + "=" * 60)
print("ENHANCED PROMPT")
print("=" * 60)

enhanced_response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=enhanced_prompt
)

print(enhanced_response.text)