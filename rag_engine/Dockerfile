# Use the official Python 3.10 image as a base image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file into the container
COPY requirements.txt .

# Create a virtual environment and install dependencies
RUN python -m venv venv
RUN /bin/bash -c "source venv/bin/activate && pip install --no-cache-dir -r requirements.txt"

# Copy the application files into the container
COPY . .

# Install the RAG engine in editable mode
EXPOSE 8001

# Run the RAG engine
CMD ["/bin/bash", "-c", "source venv/bin/activate && uvicorn api:app --host 0.0.0.0 --port 8001 --reload"]
