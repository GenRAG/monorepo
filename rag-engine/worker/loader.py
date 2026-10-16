"""
worker/loader.py

Website sitemap crawler for the ingestion worker.
Uses trafilatura for content extraction and stores scraped pages in MinIO.
"""

import time

import requests
import trafilatura
from lxml import etree

from worker.storage import upload_page, page_exists_with_same_hash


class Loader:
    """Crawl sitemap URLs and save extracted content to MinIO."""

    def __init__(
        self,
        sitemaps: list[str],
        max_pages: int | None = 100,
        storage_prefix: str | None = None,
    ):
        self.sitemaps = sitemaps
        self.max_pages = max_pages
        self.pages_scraped = 0
        self.visited_urls: set[str] = set()
        self.visited_sitemaps: set[str] = set()
        # MinIO prefix pages are archived under ({org_id}/{dataset_id})
        self.storage_prefix = storage_prefix
        # Pages scraped during this run — what the worker indexes, instead of
        # every page ever stored for the org.
        self.pages: list[dict] = []

    def get_crawlable_urls(self, url: str):
        """Fetch and parse a sitemap to extract all URLs and sub-sitemaps."""
        print(f"Fetching sitemap: {url}")
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        root = etree.fromstring(response.content)
        namespaces = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

        urls_to_crawl: list[dict] = []
        sitemaps: list[str] = []

        # Look for <url> entries (pages)
        for url_node in root.xpath("//ns:url", namespaces=namespaces):
            loc = url_node.find("ns:loc", namespaces=namespaces).text.strip()
            if loc.endswith(".xml"):
                sitemaps.append(loc)
                continue
            lastmod_node = url_node.find(
                "ns:lastmod", namespaces=namespaces
            )
            lastmod = (
                lastmod_node.text if lastmod_node is not None else None
            )
            urls_to_crawl.append({"url": loc, "lastmod": lastmod})

        # Look for <sitemap> entries (sub-sitemaps)
        for sitemap_node in root.xpath(
            "//ns:sitemap", namespaces=namespaces
        ):
            loc = (
                sitemap_node.find(
                    "ns:loc", namespaces=namespaces
                ).text.strip()
            )
            sitemaps.append(loc)

        return urls_to_crawl, sitemaps

    def scrape_page(self, url: str, lastmod: str | None) -> dict | None:
        """Scrape and extract the title and content using Trafilatura."""
        try:
            downloaded = trafilatura.fetch_url(url)
            if not downloaded:
                return None

            content = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=True,
                output_format="markdown",
            )
            if not content:
                return None

            metadata = trafilatura.extract_metadata(downloaded)

            return {
                "url": url,
                "title": (
                    metadata.title
                    if metadata and metadata.title
                    else "No Title"
                ),
                "description": (
                    metadata.description
                    if metadata and metadata.description
                    else None
                ),
                "content_md": content,
                "last_modified": lastmod,
                "last_crawled": time.strftime(
                    "%Y-%m-%dT%H:%M:%SZ", time.gmtime()
                ),
            }
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def crawl_sitemap(self, sitemap_url: str):
        """Recursively crawl a sitemap and its sub-sitemaps."""
        if sitemap_url in self.visited_sitemaps:
            return
        self.visited_sitemaps.add(sitemap_url)

        crawlable_urls, child_sitemaps = self.get_crawlable_urls(
            sitemap_url
        )
        print(
            f"Total candidate URLs discovered in {sitemap_url}: "
            f"{len(crawlable_urls)}"
        )

        for item in crawlable_urls:
            url = item["url"]
            if url in self.visited_urls:
                continue

            if (
                self.max_pages is not None
                and self.pages_scraped >= self.max_pages
            ):
                return

            self.visited_urls.add(url)
            self.pages_scraped += 1

            print(
                f"[{self.pages_scraped}/"
                f"{self.max_pages if self.max_pages else '∞'}] "
                f"Scraping: {url}"
            )
            page_data = self.scrape_page(url, item["lastmod"])
            if page_data:
                self.pages.append(page_data)
                if self.storage_prefix:
                    if not page_exists_with_same_hash(
                        self.storage_prefix, url, page_data["content_md"]
                    ):
                        upload_page(self.storage_prefix, page_data)
            time.sleep(1)

        for sm in child_sitemaps:
            self.crawl_sitemap(sm)

    def run(self):
        """Run the loader: crawl all sitemaps provided at init."""
        for url in self.sitemaps:
            if url.endswith(".xml"):
                self.crawl_sitemap(url)
            else:
                if url not in self.visited_urls:
                    self.visited_urls.add(url)
                    page_data = self.scrape_page(
                        url,
                        time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
                    )
                    if page_data:
                        self.pages.append(page_data)
                        if self.storage_prefix:
                            upload_page(self.storage_prefix, page_data)
        print("Finished loading!")