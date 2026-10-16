"""
Create an org's Qdrant collection (org_{org_id}) and its payload indexes.

Optional: the ingestion worker creates the collection automatically on an
org's first ingestion.

Usage:
    uv run python scripts/init_db.py --org-id ORG
"""

import argparse
import os
import sys

from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv()

from worker.vector_db import ensure_collection, org_collection  # noqa: E402

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--org-id", required=True)
    args = parser.parse_args()
    collection = org_collection(args.org_id)
    ensure_collection(collection, vector_size=4096)  # Qwen embedding size is 4096 dimensions
    print(f"Collection {collection} ready.")
