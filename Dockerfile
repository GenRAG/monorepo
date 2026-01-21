FROM python:3.12-slim

# Install UV and system dependencies
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
RUN uv venv -p 3.12
ENV PATH="/app/.venv/bin:$PATH"

COPY pyproject.toml .
RUN uv pip install --no-cache-dir -e .

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p /app/logs

EXPOSE 8000

CMD ["uv", "run", "fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8000"]