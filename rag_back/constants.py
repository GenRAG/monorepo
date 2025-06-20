import os

# COHERE constants
COHERE_API_KEY = os.getenv('COHERE_API_KEY')
COHERE_RERANKER_MODEL = 'rerank-v3.5'
COHERE_RERANKER_TOP_K = 5


# Pinecone constants
PINECONE_INDEX_NAME = 'poc-n-rag'
PINECONE_NAMESPACE = 'default'
PINECONE_CLOUD = os.getenv('PINECONE_CLOUD') or 'aws'
PINECONE_REGION = os.getenv('PINECONE_REGION') or 'us-east-1' # need standard account to use other regions
PINECONE_TOP_K = 20
# Pinecone embeddings model
EMBEDDINGS_MODEL_NAME = 'multilingual-e5-large'

# Pinecone API keys
PINECONE_API_KEY = os.getenv('PINECONE_API_KEY')

# LightRAG constants

# VectorRAG constants
