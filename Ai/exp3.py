from ai_client import ask_ai

# Round 1 - Basic Prompt
prompt1 = """
Summarize the plot of Romeo and Juliet in two sentences.
"""

# Round 2 - Add Length and Style Constraints
prompt2 = """
Summarize the plot of Romeo and Juliet in exactly two sentences.

Requirements:
- 30 to 40 words total
- Use clear and simple language
- Suitable for high school students
"""

# Round 3 - Add Key Content Elements
prompt3 = """
Summarize the plot of Romeo and Juliet in exactly two sentences.

Requirements:
- 30 to 40 words total
- Use clear and simple language
- Suitable for high school students
- Mention that the story takes place in Verona, Italy
- Mention the theme of love and conflict
"""

print("=" * 60)
print("ROUND 1: BASIC PROMPT")
print("=" * 60)
print(ask_ai(prompt1))

print("\n" + "=" * 60)
print("ROUND 2: LENGTH + STYLE")
print("=" * 60)
print(ask_ai(prompt2))

print("\n" + "=" * 60)
print("ROUND 3: CONTENT + SETTING + THEME")
print("=" * 60)
print(ask_ai(prompt3))