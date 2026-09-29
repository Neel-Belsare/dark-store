# ==============================================================================
# Production Dockerfile for Dark Store Logistics Platform
# Runs Streamlit Dashboard (app.py) on Port 8501
# ==============================================================================

FROM python:3.11-slim AS base

# Prevent Python from writing .pyc files and buffer stdout/stderr
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    STREAMLIT_SERVER_PORT=8501 \
    STREAMLIT_SERVER_ADDRESS=0.0.0.0 \
    STREAMLIT_SERVER_HEADLESS=true \
    STREAMLIT_BROWSER_GATHER_USAGE_STATS=false

# Set container working directory
WORKDIR /app

# Install minimal OS dependencies for health checks and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker layer caching
COPY requirements.txt /app/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all application code, datasets, and configuration
COPY . /app/

# Ensure start.sh is executable and setup non-root user
RUN chmod +x /app/start.sh && \
    useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

# Expose Streamlit default port (8501) and optional FastAPI port (8000)
EXPOSE 8501 8000

# Docker Healthcheck targeting Streamlit's internal health endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD curl --fail http://localhost:8501/_stcore/health || exit 1

# Default Command: Run both FastAPI and Streamlit concurrently via start.sh
CMD ["/app/start.sh"]
