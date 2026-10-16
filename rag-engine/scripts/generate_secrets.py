"""
Fill a .env file with strong random secrets.

Each secret is replaced only if it's missing or weak (empty, a known default
such as "change-me" / "password" / "minioadmin", or shorter than 16 chars);
strong existing values are kept unless --force is given. REDIS_URL is
rewritten to carry the new Redis password. The previous file is saved as
.env.bak, the new one is chmod 600, and no secret is ever printed.

Stdlib only, so it also runs on the server: python3 scripts/generate_secrets.py

Usage:
    python3 scripts/generate_secrets.py [--env .env] [--force KEY ...] [--dry-run]
"""

import argparse
import os
import re
import secrets
import shutil
import sys

SECRET_KEYS = ["RAG_ENGINE_API_KEY", "REDIS_PASSWORD", "QDRANT_API_KEY", "MINIO_PASSWORD"]
WEAK_VALUES = {"", "change-me", "changeme", "password", "minioadmin", "admin", "secret", "xxx"}
MIN_LENGTH = 16
LINE_RE = re.compile(r"^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$")


def unquote(value: str) -> str:
    if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
        return value[1:-1]
    return value


def is_weak(value: str) -> bool:
    return value.lower() in WEAK_VALUES or len(value) < MIN_LENGTH


def redis_url_with_password(url: str, password: str) -> str:
    """redis://[user:pass@]host:port/db -> redis://:<password>@host:port/db"""
    scheme, sep, rest = url.partition("://")
    if not sep:
        scheme, rest = "redis", url
    host = rest.rsplit("@", 1)[-1]
    return f"{scheme}://:{password}@{host}"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--env", default=".env")
    parser.add_argument("--force", nargs="*", default=[], metavar="KEY", help="regenerate these keys even if strong")
    parser.add_argument("--dry-run", action="store_true", help="only report what would change")
    args = parser.parse_args()

    lines = open(args.env).read().splitlines() if os.path.exists(args.env) else []
    index = {}
    for i, line in enumerate(lines):
        match = LINE_RE.match(line)
        if match and not line.lstrip().startswith("#"):
            index[match.group(1)] = i
    current = {k: unquote(LINE_RE.match(lines[i]).group(2)) for k, i in index.items()}

    changed, kept = [], []
    new_values = {}
    for key in SECRET_KEYS:
        if key in args.force or is_weak(current.get(key, "")):
            # hex: URL-safe (REDIS_URL) and shell/.env-safe
            new_values[key] = secrets.token_hex(32)
            changed.append(key)
        else:
            kept.append(key)

    if "REDIS_PASSWORD" in new_values:
        base = current.get("REDIS_URL") or "redis://localhost:6379/0"
        new_values["REDIS_URL"] = redis_url_with_password(base, new_values["REDIS_PASSWORD"])
        changed.append("REDIS_URL")

    for key in changed:
        print(f"  {'would set' if args.dry_run else 'set'}  {key}" + ("" if key in index else "  (added)"))
    for key in kept:
        print(f"  kept {key} (already strong)")
    if "MINIO_USER" not in current or current.get("MINIO_USER", "").lower() in {"admin", "minioadmin", ""}:
        print("  note: MINIO_USER is a default name; consider a non-obvious one")
    if args.dry_run or not changed:
        return

    for key in changed:
        entry = f"{key}={new_values[key]}"
        if key in index:
            lines[index[key]] = entry
        else:
            lines.append(entry)

    if os.path.exists(args.env):
        shutil.copy2(args.env, args.env + ".bak")
        os.chmod(args.env + ".bak", 0o600)
    with open(args.env, "w") as f:
        f.write("\n".join(lines) + "\n")
    os.chmod(args.env, 0o600)
    print(f"Wrote {args.env} (backup: {args.env}.bak, both chmod 600)")
    if "MINIO_PASSWORD" in changed:
        print("  MinIO: restart it with the new password; the app uses the same .env, so nothing else to update.")
    if "RAG_ENGINE_API_KEY" in changed:
        print("  RAG_ENGINE_API_KEY changed: give the new value to the backend (X-API-Key), or calls will get 401.")


if __name__ == "__main__":
    sys.exit(main())
