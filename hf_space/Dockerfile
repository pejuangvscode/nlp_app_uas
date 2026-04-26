FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (Docker layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Create cache directory with 777 permissions for Hugging Face Spaces
RUN mkdir -p /.cache/huggingface && chmod -R 777 /.cache
ENV HF_HOME=/.cache/huggingface

# Copy all files (including best_model and app.py)
COPY . .

# HF Spaces passes the port via the PORT environment variable, usually 7860
ENV PORT=7860
EXPOSE 7860

# Run uvicorn
CMD uvicorn app:app --host 0.0.0.0 --port $PORT
