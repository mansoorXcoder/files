import sys
import os
import json

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_client import ask_ai

def main():
    prompt = """
    Convert the following dataset into valid JSON.

    Dataset:
    1. Title: The Alchemist, Author: Paulo Coelho, Year: 1988
    2. Title: Atomic Habits, Author: James Clear, Year: 2018
    3. Title: Clean Code, Author: Robert C. Martin, Year: 2008

    Requirements:
    - Output only valid JSON
    - Use an array named 'books'
    - Each book must contain:
      title, author, publication_year
    """

    response = ask_ai(prompt)

    print("\n===== MODEL OUTPUT =====\n")
    print(response)

    print("\n===== JSON VALIDATION =====\n")
    try:
        data = json.loads(response)
        print("✅ Valid JSON")

        with open("exp_json_output.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

        print("Saved to exp_json_output.json")

    except json.JSONDecodeError as e:
        print("❌ Invalid JSON")
        print("Error:", e)

        refined_prompt = prompt + """
        
        IMPORTANT:
        - Return ONLY raw JSON
        - No explanations
        - No markdown code fences
        - No extra text before or after JSON
        """

        print("\n===== REFINED PROMPT RESPONSE =====\n")
        refined_response = ask_ai(refined_prompt)
        print(refined_response)

        try:
            data = json.loads(refined_response)
            print("\n✅ Refined output is valid JSON")

            with open("exp_json_output.json", "w", encoding="utf-8") as f:
                json.dump(data, f, indent=4)

            print("Saved to exp_json_output.json")

        except json.JSONDecodeError as e:
            print("\n❌ Refined output still invalid")
            print("Error:", e)

if __name__ == "__main__":
    main()