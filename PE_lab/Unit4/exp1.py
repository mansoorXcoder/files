from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

def main():
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash"
    )

    prompt = ChatPromptTemplate.from_template(
        "Summarize the following text:\n\n{text}"
    )

    chain = prompt | llm

    text = """
    Artificial Intelligence enables machines to perform tasks
    that normally require human intelligence, such as learning,
    reasoning, and decision-making.
    """

    result = chain.invoke({"text": text})

    print("===== SUMMARY =====\n")
    print(result.content)

if __name__ == "__main__":
    main()