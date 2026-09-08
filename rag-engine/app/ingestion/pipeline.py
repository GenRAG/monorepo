import argparse
import logging

from app.logging_config import setup_logging
from .loader import Loader
from .indexing_qwen import run_indexing


setup_logging()
logger = logging.getLogger("genrag_api.ingestion.pipeline")


def run_ingestion_pipeline(max_pages: int | None = 10):
    logger.info("Starting ingestion pipeline")
    # Load data from sitemap urls to sqlite database
    loader = Loader(max_pages=max_pages)
    loader.run_loader()

    # load data from sqlite -> create chunks -> create embeddings -> store in vector db
    run_indexing()
    logger.info("Ingestion pipeline completed")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run the ingestion pipeline.")
    parser.add_argument(
        "--max-pages",
        type=int,
        default=10,
        help="Max pages to crawl per sitemap (0 for no limit).",
    )
    args = parser.parse_args()
    run_ingestion_pipeline(max_pages=args.max_pages)
