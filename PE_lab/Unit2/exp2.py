import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_client import ask_ai
def main():
    base_query = "Suggest investment options for a young professional with moderate risk tolerance."

    # Role-Based Prompt
    role_prompt = f"""
    You are a certified financial advisor.
    Provide professional and practical investment advice.

    Question:
    {base_query}
    """

    # Negative Prompt
    negative_prompt = f"""
    You are a certified financial advisor.
    Provide professional and practical investment advice.

    Do not mention any brand names, company names, or specific financial products.

    Question:
    {base_query}
    """

    print("\n===== ROLE-BASED PROMPT RESPONSE =====\n")
    print(ask_ai(role_prompt))

    print("\n===== NEGATIVE PROMPT RESPONSE =====\n")
    print(ask_ai(negative_prompt))

    print("\n===== EVALUATION =====")
    print("1. Role-Based Prompt:")
    print("- Response adopts the persona of a financial advisor.")
    print("- Advice is more professional and domain-focused.")

    print("\n2. Negative Prompt:")
    print("- Undesired content (brand/company names) is suppressed.")
    print("- Response becomes more generic and constraint-focused.")

if __name__ == "__main__":
    main()