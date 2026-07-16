import sqlite3
import hashlib
from pathlib import Path
from typing import Optional, Dict

BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "data.db"


class SQLiteStore:
    def __init__(self, db_path: Path = DB_PATH):
        db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn = sqlite3.connect(db_path)
        self.conn.row_factory = sqlite3.Row
        self._create_table()

    def _create_table(self):
        self.conn.execute("""
        CREATE TABLE IF NOT EXISTS pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE,
            title TEXT,
            description TEXT,
            content_md TEXT,
            content_hash TEXT,
            last_modified TEXT,
            last_crawled TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)
        self.conn.commit()

    @staticmethod
    def hash_text(text: str) -> str:
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def get_by_url(self, url: str) -> Optional[Dict]:
        cur = self.conn.execute("SELECT * FROM pages WHERE url = ?", (url,))
        row = cur.fetchone()
        return dict(row) if row else None

    def upsert_page(self, page_data: Dict) -> Dict:
        """
        page_data keys:
            url, title, description, content_md,
            last_modified, last_crawled
        """
        content_hash = self.hash_text(page_data["content_md"])
        existing = self.get_by_url(page_data["url"])

        if existing and existing["content_hash"] == content_hash:
            return {
                "page_id": existing["id"],
                "changed": False,
                "content_hash": content_hash,
            }

        self.conn.execute(
            """
        INSERT INTO pages (
            url, title, description, content_md,
            content_hash, last_modified, last_crawled
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(url) DO UPDATE SET
            title=excluded.title,
            description=excluded.description,
            content_md=excluded.content_md,
            content_hash=excluded.content_hash,
            last_modified=excluded.last_modified,
            last_crawled=excluded.last_crawled
        """,
            (
                page_data["url"],
                page_data.get("title"),
                page_data.get("description"),
                page_data["content_md"],
                content_hash,
                page_data.get("last_modified"),
                page_data.get("last_crawled"),
            ),
        )

        self.conn.commit()

        page_id = self.get_by_url(page_data["url"])["id"]
        return {
            "page_id": page_id,
            "changed": True,
            "content_hash": content_hash,
        }

    def get_last_modified(self, url: str):
        cur = self.conn.execute(
            "SELECT id, last_modified FROM pages WHERE url = ?", (url,)
        )
        row = cur.fetchone()
        return dict(row) if row else None

    def get_documents(self):
        cur = self.conn.execute("SELECT * FROM pages")
        rows = cur.fetchall()
        return [dict(row) for row in rows]
    
    def get_document_by_id(self, id: int):
        cur = self.conn.execute("SELECT * FROM pages WHERE id = ?", (id,))
        row = cur.fetchone()
        if row:
            return dict(row)
        return None 
