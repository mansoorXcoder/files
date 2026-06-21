from dotenv import load_dotenv
from langchain_core.documents import Document
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import (
    ChatGoogleGenerativeAI,
    GoogleGenerativeAIEmbeddings
)
from langchain_community.vectorstores import FAISS

load_dotenv()

def main():
    # Step 1: Load Documents
    docs = [
        Document(
            page_content="""
            Artificial Intelligence (AI) enables machines to perform tasks
            that typically require human intelligence, such as learning,
            reasoning, and decision-making.
            """
        ),
        Document(
            page_content="""
            Machine Learning (ML) is a subset of AI that allows systems
            to learn from data and improve performance without being
            explicitly programmed.
            """
        ),
        Document(
            page_content="""
            Deep Learning is a specialized branch of Machine Learning
            that uses neural networks with multiple layers for tasks
            such as image recognition and natural language processing.
            """
        )
    ]

    # Step 2: Split into Chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=200,
        chunk_overlap=20
    )

    chunks = splitter.split_documents(docs)

    # Step 3: Create Embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001"
    )

    # Step 4: Create In-Memory Vector Store
    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )

    # Step 5: User Query
    query = input("Enter your question: ")

    # Step 6: Retrieve Top-K Chunks
    k = 2
    retrieved_docs = vector_store.similarity_search(
        query,
        k=k
    )

    context = "\n\n".join(
        [doc.page_content for doc in retrieved_docs]
    )

    print("\n===== RETRIEVED CONTEXT =====\n")
    print(context)

    # Step 7: Construct Prompt
    prompt = f"""
    Answer the question using ONLY the provided context.

    Context:
    {context}

    Question:
    {query}

    Answer:
    """

    # Step 8: Send to LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash"
    )

    response = llm.invoke(prompt)

    # Step 9: Return Answer
    print("\n===== RAG ANSWER =====\n")
    print(response.content)

    # Save Output
    with open("rag_chain_output.txt", "w", encoding="utf-8") as f:
        f.write("QUESTION:\n")
        f.write(query)

        f.write("\n\nRETRIEVED CONTEXT:\n")
        f.write(context)

        f.write("\n\nANSWER:\n")
        f.write(response.content)

    print("\nOutput saved to rag_chain_output.txt")

if __name__ == "__main__":
    main()