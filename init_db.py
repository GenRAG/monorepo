from qdrant_client import QdrantClient, models

# Connect to the local Qdrant instance
client = QdrantClient(url="http://localhost:6333")
COLLECTION_NAME = "shared_knowledge_base"


def setup_db():
    # 1. Create the Main Collection (if it doesn't exist)
    if not client.collection_exists(COLLECTION_NAME):
        print(f"Creating collection: {COLLECTION_NAME}...")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=1536,  # Change this if not using OpenAI (e.g. 768 for Mistral)
                distance=models.Distance.COSINE,
            ),
        )
    else:
        print(f"Collection {COLLECTION_NAME} already exists.")

    # 2. CREATE THE PAYLOAD INDEX (The "GenRAG" Secret Sauce)
    # This makes filtering by 'org_id' instant, even with millions of vectors.
    print("Creating Payload Index for 'org_id'...")
    client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="org_id",
        field_schema=models.PayloadSchemaType.KEYWORD,
    )
    print("SUCCESS: Database is optimized for multi-tenancy!")


if __name__ == "__main__":
    setup_db()
