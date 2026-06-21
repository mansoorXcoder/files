import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_client import ask_ai
from ai_client import ask_ai

def main():
    bullet_prompt = """
    List three benefits of daily exercise.

    Requirements:
    - Use a bullet list
    - Exactly 3 points
    """

    table_prompt = """
    List three benefits of daily exercise in a Markdown table.

    Requirements:
    - Columns: Benefit, Description
    - Exactly 3 rows
    - Output only the Markdown table
    """

    print("\n===== BULLET LIST OUTPUT =====\n")
    bullet_response = ask_ai(bullet_prompt)
    print(bullet_response) 
    bullet_response = ask_ai(bullet_prompt)
    print("\n===== MARKDOWN TABLE OUTPUT =====\n")
    table_response = ask_ai(table_prompt)
    print(table_response) 
    table_response = ask_ai(table_prompt)
    print("\n===== VERIFICATION =====")
    print("1. Bullet Prompt: Check whether the response contains exactly 3 bullet points.")
    print("2. Table Prompt: Check whether the response is a Markdown table with columns 'Benefit' and 'Description'.")
    print("3. Verify that exactly 3 benefits are listed in the table.")
    with open("output.txt", "w", encoding="utf-8") as f:
        f.write("===== BULLET LIST OUTPUT =====\n\n")
        f.write(bullet_response)
        f.write("\n\n===== MARKDOWN TABLE OUTPUT =====\n\n")
        f.write(table_response)

print("Result saved to output.txt")


if __name__ == "__main__":
    main()