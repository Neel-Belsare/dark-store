#!/bin/bash
set -e

# If arguments are passed, execute them directly (e.g. for docker-compose overrides)
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

# Default behavior: Launch both FastAPI and Streamlit concurrently
echo "=========================================================="
echo "🛒 Quick-Commerce Dark Store Platform Container"
echo "=========================================================="

echo "🚀 Starting FastAPI Dispatch Bridge on port 8000..."
uvicorn api:app --host 0.0.0.0 --port 8000 &

echo "📊 Starting Streamlit Command Center on port 8501..."
exec streamlit run app.py --server.port=8501 --server.address=0.0.0.0
