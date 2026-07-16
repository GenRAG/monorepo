from qdrant_client import QdrantClient, models

client = QdrantClient(url="http://localhost:6333")
COLLECTION_NAME = "genrag_knowledge_base"


def setup_db():
    if not client.collection_exists(COLLECTION_NAME):
        print(f"Creating collection: {COLLECTION_NAME}...")
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(
                size=4096,  # Qwen embedding size is 4096 dimensions
                distance=models.Distance.COSINE,
            ),
        )
    else:
        print(f"Collection {COLLECTION_NAME} already exists.")

    client.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="org_id",
        field_schema=models.PayloadSchemaType.KEYWORD,
    )

if __name__ == "__main__":
    setup_db()
