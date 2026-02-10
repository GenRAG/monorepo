# Create an API Key at https://dashboard.zeroentropy.dev
# pip install zeroentropy
from zeroentropy import ZeroEntropy
import os
from dotenv import load_dotenv
# Load environment variables from .env file
load_dotenv()

print("ZeroEntropy Reranking Example:")

# Initialize the ZeroEntropy client (reads ZEROENTROPY_API_KEY from env)
zclient = ZeroEntropy()

response = zclient.models.rerank(
    model="zerank-2",
    query="What is the capital of the United States?",
    documents=[
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Capitalization or capitalisation in English grammar is the use of a capital letter at the start of a word. English usage varies from capitalization in other languages.",
    "Washington, D.C. (also known as simply Washington or D.C., and officially as the District of Columbia) is the capital of the United States. It is a federal district.",
    "Capital punishment has existed in the United States since beforethe United States was a country. As of 2017, capital punishment is legal in 30 of the 50 states.",
])
print(response.model_dump_json(indent=4))

print("Cohere Reranking Example:")

import cohere

co = cohere.ClientV2()

docs = [
    "Carson City is the capital city of the American state of Nevada.",
    "The Commonwealth of the Northern Mariana Islands is a group of islands in the Pacific Ocean. Its capital is Saipan.",
    "Capitalization or capitalisation in English grammar is the use of a capital letter at the start of a word. English usage varies from capitalization in other languages.",
    "Washington, D.C. (also known as simply Washington or D.C., and officially as the District of Columbia) is the capital of the United States. It is a federal district.",
    "Capital punishment has existed in the United States since beforethe United States was a country. As of 2017, capital punishment is legal in 30 of the 50 states.",
]

response = co.rerank(
    model="rerank-v4.0-pro",
    query="What is the capital of the United States?",
    documents=docs,
    top_n=3,
)


for item in response.results:
    print(f"Document {item.index}: {docs[item.index]}")
    print(f"Relevance Score: {item.relevance_score}")
    print()
