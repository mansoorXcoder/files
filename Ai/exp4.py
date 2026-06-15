from ai_client import ask_ai

# Vague / Contradictory Prompt
bad_prompt = """
Write a detailed summary of Artificial Intelligence.
Keep it under 20 words and explain everything important.
"""

# Improved Prompt
good_prompt = """
You are an AI educator.

Write a concise summary of Artificial Intelligence.

Requirements:
- 40 to 50 words
- Explain what AI is
- Mention one practical application
- Use simple language suitable for beginners
- Output exactly one paragraph
"""

print("=" * 60)
print("BAD PROMPT")
print("=" * 60)

print(ask_ai(bad_prompt))

print("\n" + "=" * 60)
print("REFINED PROMPT")
print("=" * 60)

print(ask_ai(good_prompt))