import sys
import os

sys.path.append(
    os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..")
    )
)

from ai_client import ask_ai

prompts = {
    "ROUND 1: BASIC PROMPT": """
    Summarize the plot of Romeo and Juliet in two sentences.
    """,

    "ROUND 2: LENGTH + STYLE": """
    Summarize the plot of Romeo and Juliet in exactly two sentences.

    Requirements:
    - 30 to 40 words total
    - Use clear and simple language
    - Suitable for high school students
    """,

    "ROUND 3: CONTENT + SETTING + THEME": """
    Summarize the plot of Romeo and Juliet in exactly two sentences.

    Requirements:
    - 30 to 40 words total
    - Use clear and simple language
    - Suitable for high school students
    - Mention that the story takes place in Verona, Italy
    - Mention the theme of love and conflict
    """
}

for title, prompt in prompts.items():
    print("=" * 60)
    print(title)
    print("=" * 60)

    try:
        response = ask_ai(prompt)
        print(response)
    except Exception as e:
        print(f"Error: {e}")

    print()
with open("output.txt", "w", encoding="utf-8") as f:
    f.write(response)