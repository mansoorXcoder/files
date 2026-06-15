import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_client import ask_ai

text = "The movie was amazing and I enjoyed every moment."

# Zero-Shot Prompt
zero_shot_prompt = f"""
Classify the sentiment of the following text as
Positive, Negative, or Neutral.

Text: "{text}"
"""

# Few-Shot Prompt
few_shot_prompt = f"""
Classify the sentiment as Positive, Negative, or Neutral.

Example 1:
Text: "I love this product."
Output: Positive

Example 2:
Text: "This service is terrible."
Output: Negative

Example 3:
Text: "The meeting was held at 10 AM."
Output: Neutral

Now classify:

Text: "{text}"
Output:
"""

print("=" * 50)
print("ZERO-SHOT RESULT")
print("=" * 50)
print(ask_ai(zero_shot_prompt))

print("\n" + "=" * 50)
print("FEW-SHOT RESULT")
print("=" * 50)
print(ask_ai(few_shot_prompt))