import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_client import ask_ai

def main():
    article = """
    Artificial Intelligence (AI) is transforming industries by enabling
    automation, data-driven decision making, and advanced problem solving.
    Applications include healthcare, finance, education, and transportation.
    However, challenges such as data privacy, bias, and ethical concerns
    remain important considerations.
    """

    # Basic Prompt
    prompt1 = f"""
    Summarize the following article:

    {article}
    """

    # Refinement Cycle 1
    prompt2 = f"""
    Summarize the following article in 50 words or less.

    Article:
    {article}
    """

    # Refinement Cycle 2
    prompt3 = f"""
    Summarize the following article.

    Constraints:
    - Maximum 50 words
    - Use exactly 3 bullet points
    - Focus only on key ideas
    - Do not include extra explanations

    Article:
    {article}
    """

    print("\n===== BASIC PROMPT =====\n")
    print(ask_ai(prompt1))

    print("\n===== REFINEMENT CYCLE 1 =====\n")
    print(ask_ai(prompt2))

    print("\n===== REFINEMENT CYCLE 2 =====\n")
    print(ask_ai(prompt3))

    print("\n===== IMPROVEMENT ANALYSIS =====")
    print("Cycle 0: Summary length and format are uncontrolled.")
    print("Cycle 1: Word-count constraint improves brevity.")
    print("Cycle 2: Bullet-point and content constraints improve structure, consistency, and readability.")

if __name__ == "__main__":
    main()