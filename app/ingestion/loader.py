import requests
from bs4 import BeautifulSoup
import time
from lxml import etree
import re
from markdownify import markdownify as md
from app.ingestion.sqlite_store import SQLiteStore

BASE_SITEMAP_URL = "https://www.nhs.uk"


class Loader:
    def __init__(
        self,
        sitemaps: list[str] = [f"{BASE_SITEMAP_URL}/sitemap-cms-content.xml"],
        max_pages: int | None = None,
        interactive: bool = True,
    ):
        """Crawling sitemap urls and saving retrived content to embedded sqlite database"""
        self.sitemaps = sitemaps
        self.max_pages = max_pages
        self.interactive = interactive
        self.visited_sitemaps = set()

    def get_crawlable_urls(self, url: str):
        """Fetches and parses the sitemap to extract all URLs."""
        print(f"Fetching sitemap: {url}")
        response = requests.get(url)
        response.raise_for_status()

        root = etree.fromstring(response.content)

        namespaces = {"ns": "http://www.sitemaps.org/schemas/sitemap/0.9"}

        urls_to_crawl = []
        sitemaps = []

        for url_node in root.xpath("//ns:url", namespaces=namespaces):
            loc = url_node.find("ns:loc", namespaces=namespaces).text.strip()

            if loc.endswith(".xml"):
                sitemaps.append(loc)
                continue

            if loc.startswith(f"{BASE_SITEMAP_URL}/?") or loc.startswith(
                f"{BASE_SITEMAP_URL}?"
            ):
                continue

            lastmod_node = url_node.find("ns:lastmod", namespaces=namespaces)
            lastmod = lastmod_node.text if lastmod_node is not None else None
            urls_to_crawl.append({"url": loc, "lastmod": lastmod})

        print(f"Found {len(urls_to_crawl)} URLs in sitemap & {len(sitemaps)} sitemaps.")
        return urls_to_crawl[371:], sitemaps

    @staticmethod
    def store_data(data, store: SQLiteStore):
        store.upsert_page(
            {
                "url": data["url"],
                "title": data["title"],
                "description": data["description"],
                "content_md": data["text"],
                "last_modified": data["last_modified"],
                "last_crawled": data["last_crawled"],
            }
        )

    @staticmethod
    def clean_markdown_content(markdown_text):
        """Removes noise"""
        noise_patterns = [
            r"(?i)back to top",
            r"(?i)terms of use",
            r"(?i)cookie policy",
            r"(?i)privacy policy",
            r"(?i)last reviewed:.*",
            r"(?i)share this page",
        ]

        for pattern in noise_patterns:
            markdown_text = re.sub(pattern, "", markdown_text)

        markdown_text = re.sub(r"\n{3,}", "\n\n", markdown_text)

        return markdown_text.strip()

    def scrape_page(self, url, lastmod):
        """Scrapes and extracts the title and content"""
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()

            soup = BeautifulSoup(response.text, "lxml")

            main_content = soup.find("main")

            if not main_content:
                return None

            title_tag = soup.title
            h1_tag = soup.find("h1")

            if title_tag and title_tag.string:
                title = title_tag.string.split("-")[0].strip()
            elif h1_tag:
                title = h1_tag.get_text(strip=True)
            else:
                title = "No Title"

            description_tag = soup.find("meta", attrs={"name": "description"})
            description = (
                description_tag["content"]
                if description_tag and description_tag.get("content")
                else None
            )

            for element in main_content(
                [
                    "script",
                    "style",
                    "nav",
                    "footer",
                    "button",
                    "form",
                    "noscript",
                    "header",
                ]
            ):
                element.decompose()

            for img in main_content.find_all("img"):
                alt_text = img.get("alt", "").strip()
                src = img.get("src", "").strip()

                if alt_text:
                    img.replace_with(f"\n\n[Image: {alt_text}]\n\n")
                elif src:
                    filename = src.split("/")[-1]
                    img.replace_with(f"\n\n[Image: {filename}]\n\n")
                else:
                    img.decompose()

            for figure in main_content.find_all("figure"):
                caption = figure.find("figcaption")
                img = figure.find("img")

                if caption:
                    text = caption.get_text(strip=True)
                elif img and img.get("alt"):
                    text = img["alt"].strip()
                else:
                    text = None

                if text:
                    figure.replace_with(f"\n\n[Image: {text}]\n\n")
                else:
                    figure.decompose()

            for a in main_content.find_all("a"):
                anchor_text = a.get_text(strip=True)
                href = a.get("href", "").strip()

                if (
                    anchor_text
                    and href
                    and not href.startswith("#")
                    and not href.startswith("javascript")
                ):
                    a.replace_with(f"{anchor_text} ({href})")
                else:
                    a.replace_with(anchor_text if anchor_text else "")

            content = md(str(main_content), heading_style="ATX", strip=["a", "img"])
            content = self.clean_markdown_content(content)

            return {
                "url": url,
                "title": title,
                "description": description,
                "text": content,
                "last_modified": lastmod,
                "last_crawled": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }
        except Exception as e:
            print(f"Error scraping {url}: {e}")
            return None

    def prompt_for_next_sitemap(self, sitemaps: list[str]):
        """Ask user which sitemap to crawl next by index"""
        if not self.interactive:
            return None

        if not sitemaps:
            return None

        print("\nDiscovered sitemaps:")
        for i, sm in enumerate(sitemaps):
            print(f"[{i}] {sm}")

        choice = input(
            "Enter sitemap index to crawl next (or press Enter to skip): "
        ).strip()

        if choice.isdigit():
            idx = int(choice)
            if 0 <= idx < len(sitemaps):
                return sitemaps[idx]

        print("Skipping deeper crawl.")
        return None

    def crawl_sitemap(self, sitemap_url: str, store: SQLiteStore):
        """Get urls from the sitemap to crawl and store each url content to sqlite"""
        if sitemap_url in self.visited_sitemaps:
            return

        self.visited_sitemaps.add(sitemap_url)

        crawlable_urls, child_sitemaps = self.get_crawlable_urls(sitemap_url)

        if self.max_pages is None or self.max_pages <= 0:
            page_iter = crawlable_urls
        else:
            page_iter = crawlable_urls[: self.max_pages]

        for i, item in enumerate(page_iter):
            url = item["url"]
            lastmod = item["lastmod"]

            print(f"[{i + 1}/{len(crawlable_urls)}] Scraping: {url}")

            page_data = self.scrape_page(url, lastmod)

            if not page_data:
                continue

            self.store_data(page_data, store)

            time.sleep(1)

        next_sitemap = self.prompt_for_next_sitemap(child_sitemaps)

        if next_sitemap:
            self.crawl_sitemap(next_sitemap, store)

    def run_loader(self):
        store = SQLiteStore()

        for url in self.sitemaps:
            if url in self.visited_sitemaps:
                continue

            if url.endswith(".xml"):
                self.crawl_sitemap(url, store)
            else:
                print(f"Scraping single page: {url}")
                lastmod = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                page_data = self.scrape_page(url, lastmod)
                if page_data:
                    self.store_data(page_data, store)
                    self.visited_sitemaps.add(url)

        print("Finished loading data in database!")
        return store


if __name__ == "__main__":
    loader = Loader()
    loader.run_loader()
