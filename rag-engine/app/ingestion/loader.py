import trafilatura
import time
from app.ingestion.sqlite_store import SQLiteStore
from app.services.storage import upload_page, page_exists_with_same_hash
from lxml import etree
import requests

BASE_SITEMAP_URL = "https://www.nhs.uk"

class Loader:
    def __init__(
        self,
        sitemaps: list[str] = [f"{BASE_SITEMAP_URL}/sitemap-cms-content.xml"],
        max_pages: int | None = None,
        interactive: bool = True,
        org_id: str | None = None,
    ):
        """Crawling sitemap urls and saving retrieved content.

        When org_id is provided, stores pages in MinIO instead of SQLite.
        """
        self.sitemaps = sitemaps
        self.max_pages = max_pages
        self.pages_scraped = 0
        self.interactive = interactive
        self.visited_urls = set()
        self.visited_sitemaps = set()
        self.org_id = org_id

    def get_crawlable_urls(self, url: str):
        """Fetches and parses the sitemap to extract all URLs."""
        print(f"Fetching sitemap: {url}")
        response = requests.get(url)
        response.raise_for_status()

        root = etree.fromstring(response.content)
        namespaces = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

        urls_to_crawl = []
        sitemaps = []

        # Look for <url> (pages)
        for url_node in root.xpath("//ns:url", namespaces=namespaces):
            loc = url_node.find("ns:loc", namespaces=namespaces).text.strip()
            # Also handle if it's actually a sitemap link inside <url> (rare but happens)
            if loc.endswith(".xml"):
                sitemaps.append(loc)
                continue

            lastmod_node = url_node.find("ns:lastmod", namespaces=namespaces)
            lastmod = lastmod_node.text if lastmod_node is not None else None
            urls_to_crawl.append({"url": loc, "lastmod": lastmod})

        # Look for <sitemap> (sub-sitemaps)
        for sitemap_node in root.xpath("//ns:sitemap", namespaces=namespaces):
            loc = sitemap_node.find("ns:loc", namespaces=namespaces).text.strip()
            sitemaps.append(loc)

        return urls_to_crawl, sitemaps

    def store_data(self, data, store: SQLiteStore | None = None):
        page_data = {
            "url": data["url"],
            "title": data["title"],
            "description": data["description"],
            "content_md": data["text"],
            "last_modified": data["last_modified"],
            "last_crawled": data["last_crawled"],
        }

        if self.org_id:
            if not page_exists_with_same_hash(self.org_id, data["url"], data["text"]):
                upload_page(self.org_id, page_data)
            return

        if store is not None:
            store.upsert_page(page_data)

    def scrape_page(self, url, lastmod):
        """Scrapes and extracts the title and content using Trafilatura."""
        try:
            downloaded = trafilatura.fetch_url(url)
            if not downloaded:
                return None

            content = trafilatura.extract(
                downloaded,
                include_comments=False,
                include_tables=True,
                output_format="markdown"
            )

            if not content:
                return None

            metadata = trafilatura.extract_metadata(downloaded)

            return {
                "url": url,
                "title": metadata.title if metadata and metadata.title else "No Title",
                "description": metadata.description if metadata and metadata.description else None,
                "text": content,
                "last_modified": lastmod,
                "last_crawled": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def crawl_sitemap(self, sitemap_url: str, store: SQLiteStore):
        if sitemap_url in self.visited_sitemaps:
            return
        self.visited_sitemaps.add(sitemap_url)

        crawlable_urls, child_sitemaps = self.get_crawlable_urls(sitemap_url)
        print(f"Total candidate URLs discovered in {sitemap_url}: {len(crawlable_urls)}")

        for item in crawlable_urls:
            url = item["url"]
            if url in self.visited_urls:
                continue

            if self.max_pages is not None and self.pages_scraped >= self.max_pages:
                return

            self.visited_urls.add(url)
            self.pages_scraped += 1

            print(f"[{self.pages_scraped}/{self.max_pages if self.max_pages else '∞'}] Scraping: {url}")
            page_data = self.scrape_page(url, item["lastmod"])
            if page_data:
                self.store_data(page_data, store)
            time.sleep(1)

        for sm in child_sitemaps:
            self.crawl_sitemap(sm, store)

    def run_loader(self):
        store = SQLiteStore()
        for url in self.sitemaps:
            if url.endswith(".xml"):
                self.crawl_sitemap(url, store)
            else:
                if url not in self.visited_urls:
                    self.visited_urls.add(url)
                    page_data = self.scrape_page(url, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()))
                    if page_data:
                        self.store_data(page_data, store)
        print("Finished loading!")
        return store
