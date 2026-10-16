FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
COPY pyproject.toml README.md ./
RUN uv sync --no-dev
COPY . .
ENV PATH="/app/.venv/bin:$PATH"
EXPOSE 8000
# Multiple worker processes so CPU-bound work (thread-offloaded Qdrant calls, JSON
# parsing, etc.) in one request can't stall other users on a single event loop.
# Override with WEB_CONCURRENCY at deploy time to match available CPU cores.
ENV WEB_CONCURRENCY=4
CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers ${WEB_CONCURRENCY}"]