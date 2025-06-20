FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN python -m venv venv && \
    /bin/bash -c "source venv/bin/activate && pip install --no-cache-dir -r requirements.txt"

COPY . .

RUN /bin/bash -c "source venv/bin/activate && cd LightRAG && pip install -e . && cd .."

EXPOSE 8000

CMD ["/bin/bash", "-c", "source venv/bin/activate && uvicorn api:app --reload --host 0.0.0.0 --port 8000"]