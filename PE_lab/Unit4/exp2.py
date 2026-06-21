from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS

load_dotenv()

def main():
    # Sample documents
    docs = [
        Document(
            page_content="""
            Artificial Intelligence enables machines to perform tasks
            that normally require human intelligence such as learning,
            reasoning, and decision making.
            """
        ),
        Document(
            page_content="""
            Machine Learning is a subset of AI that allows systems
            to learn patterns from data and improve performance
            without explicit programming.
            """
        ),
        Document(
            page_content="""
            Deep Learning uses neural networks with multiple layers
            to solve complex problems such as image recognition and
            natural language processing.
            """
        )
    ]

    # Split documents into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=200,
        chunk_overlap=20
    )

    chunks = splitter.split_documents(docs)

    print(f"Original Documents: {len(docs)}")
    print(f"Generated Chunks: {len(chunks)}")

    # Generate embeddings
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001"
    )

    # Store in memory vector store
    vector_store = FAISS.from_documents(
        documents=chunks,
        embedding=embeddings
    )

    print("\n===== CHUNK INSPECTION =====")
    for i, chunk in enumerate(chunks, start=1):
        print(f"\nChunk {i}:")
        print(chunk.page_content[:100] + "...")

    print("\n===== VECTOR STORE INFO =====")
    print("Chunks indexed successfully.")

    # Consistency check
    query = "What is Machine Learning?"

    results = vector_store.similarity_search(
        query,
        k=2
    )

    print("\n===== RETRIEVAL TEST =====")
    for i, doc in enumerate(results, start=1):
        print(f"\nResult {i}:")
        print(doc.page_content)

    # Save report
    with open("rag_index_report.txt", "w", encoding="utf-8") as f:
        f.write(f"Original Documents: {len(docs)}\n")
        f.write(f"Generated Chunks: {len(chunks)}\n\n")

        for i, chunk in enumerate(chunks, start=1):
            f.write(f"Chunk {i}\n")
            f.write(chunk.page_content)
            f.write("\n\n")

        f.write("Retrieval Test Query:\n")
        f.write(query)
        f.write("\n\n")

        for i, doc in enumerate(results, start=1):
            f.write(f"Result {i}\n")
            f.write(doc.page_content)
            f.write("\n\n")

    print("\nReport saved to rag_index_report.txt")

if __name__ == "__main__":
    main()