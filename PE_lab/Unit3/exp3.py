import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai_client import ask_ai

def main():
    problem = """
    A train travels 120 km in 2 hours and then 180 km in 3 hours.
    What is the average speed of the train for the entire journey?
    """

    # Direct Answer Baseline
    baseline_prompt = f"""
    Solve the following problem and give only the final answer.

    Problem:
    {problem}
    """

    # Zero-Shot Chain of Thought
    cot_prompt = f"""
    Solve the following problem.

    Let's think step by step.
    Explain your reasoning before giving the final answer.

    Problem:
    {problem}
    """

    # Task Decomposition
    subq1 = """
    A train travels 120 km in 2 hours.
    What is the distance and time for the first part?
    """

    subq2 = """
    A train travels 180 km in 3 hours.
    What is the distance and time for the second part?
    """

    subq3 = """
    If the total distance is 300 km and the total time is 5 hours,
    what is the average speed?
    """

    baseline_response = ask_ai(baseline_prompt)
    cot_response = ask_ai(cot_prompt)

    part1 = ask_ai(subq1)
    part2 = ask_ai(subq2)
    part3 = ask_ai(subq3)

    print("\n===== DIRECT ANSWER BASELINE =====\n")
    print(baseline_response)

    print("\n===== ZERO-SHOT CHAIN OF THOUGHT =====\n")
    print(cot_response)

    print("\n===== TASK DECOMPOSITION =====\n")
    print("Sub-question 1:")
    print(part1)

    print("\nSub-question 2:")
    print(part2)

    print("\nSub-question 3:")
    print(part3)

    print("\n===== COMPARISON =====")
    print("1. Baseline: Direct answer without intermediate reasoning.")
    print("2. Zero-Shot CoT: Encourages step-by-step reasoning.")
    print("3. Task Decomposition: Breaks the problem into smaller sub-problems and combines results.")
    print("4. Compare the correctness and clarity of all three approaches.")

    with open("exp_cot_output.txt", "w", encoding="utf-8") as f:
        f.write("===== DIRECT ANSWER BASELINE =====\n\n")
        f.write(baseline_response)

        f.write("\n\n===== ZERO-SHOT CHAIN OF THOUGHT =====\n\n")
        f.write(cot_response)

        f.write("\n\n===== TASK DECOMPOSITION =====\n\n")
        f.write("Sub-question 1:\n")
        f.write(part1)

        f.write("\n\nSub-question 2:\n")
        f.write(part2)

        f.write("\n\nSub-question 3:\n")
        f.write(part3)

    print("\nResults saved to exp_cot_output.txt")

if __name__ == "__main__":
    main()