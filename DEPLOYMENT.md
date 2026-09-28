# 🚀 Production Deployment Guide: Dark Store Command Center & Dispatch Engine

This guide walks you through building, testing, and deploying the **Dark Store Logistics Platform** (`app.py`, `api.py`) using Docker on standard cloud providers (such as **Render**, **AWS App Runner / ECS**, or **Fly.io**) as well as your local machine.

Migrating away from Streamlit Community Cloud gives you:
- **Zero Injected Console Errors**: Eliminates Streamlit Cloud's internal wrapper calls (`/api/v2/user/details`, `heap.js`, and iframe permissions warnings).
- **Dedicated Compute & Memory**: Full CPU and RAM isolation with no arbitrary sleep timeouts or resource limits.
- **Unified Full-Stack Deployment**: Run both the Streamlit Dashboard (Port `8501`) and the FastAPI Dispatch Engine (Port `8000`) concurrently.

---

## 📦 File Architecture

| File | Purpose |
| :--- | :--- |
| [`Dockerfile`](file:///Users/neelkiranbelsare/.gemini/antigravity/scratch/Dark-Store-Feasibility-Analysis/Dockerfile) | Production multi-stage Debian-slim container image running `app.py` via Streamlit CLI on port `8501`. |
| [`docker-compose.yml`](file:///Users/neelkiranbelsare/.gemini/antigravity/scratch/Dark-Store-Feasibility-Analysis/docker-compose.yml) | Orchestrates local dual-service testing: Streamlit Command Center (8501) + FastAPI Backend (8000). |
| [`.dockerignore`](file:///Users/neelkiranbelsare/.gemini/antigravity/scratch/Dark-Store-Feasibility-Analysis/.dockerignore) | Prevents local virtual environments, `.git`, and mobile-app artifacts from bloating the build context. |
| [`.streamlit/config.toml`](file:///Users/neelkiranbelsare/.gemini/antigravity/scratch/Dark-Store-Feasibility-Analysis/.streamlit/config.toml) | Disables external telemetry (`gatherUsageStats = false`) and configures headless server mode. |

---

## 🛠️ 1. Local Testing with Docker Compose (Recommended)

Docker Compose starts both the **Streamlit Command Center** and the **FastAPI Dispatch Engine** with shared real-time order volume mounts:

```bash
# 1. Clone repository and navigate to root directory
cd Dark-Store-Feasibility-Analysis

# 2. Build the Docker image
docker compose build

# 3. Start both services in detached mode
docker compose up -d

# 4. View live container logs
docker compose logs -f
```

### Accessing Local Services:
- **Streamlit Command Center**: [http://localhost:8501](http://localhost:8501)
- **FastAPI Dispatch REST API**: [http://localhost:8000](http://localhost:8000)
- **Interactive Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **WebSocket Courier Stream**: `ws://localhost:8000/ws/tracking/{order_id}`

### Stop Containers:
```bash
docker compose down
```

---

## 🐳 2. Standalone Docker Run (Streamlit Only)

If you only want to build and run the Streamlit dashboard as a standalone container:

```bash
# 1. Build the image
docker build -t dark-store-app:latest .

# 2. Run container mapped to port 8501
docker run -d \
  --name dark-store-streamlit \
  -p 8501:8501 \
  -v $(pwd)/latest_order.json:/app/latest_order.json \
  dark-store-app:latest

# 3. Check health status
docker ps
```

---

## ☁️ 3. Deploying to Render.com

Render natively builds and runs Docker containers directly from your GitHub repository.

1. **Log in to [Render](https://render.com/)** and select **New +** ➔ **Web Service**.
2. **Connect your GitHub repo**: Select `NeelBelsare/my-dark-store-app`.
3. **Environment**: Choose **Docker** (Render will automatically detect your `Dockerfile`).
4. **Configuration Settings**:
   - **Name**: `dark-store-command-center`
   - **Region**: Choose closest to target users (e.g., *Singapore* or *Frankfurt*).
   - **Branch**: `main`
   - **Plan**: *Free* or *Starter ($7/mo)*.
5. **Environment Variables**:
   ```ini
   PORT=8501
   STREAMLIT_SERVER_PORT=8501
   STREAMLIT_SERVER_ADDRESS=0.0.0.0
   STREAMLIT_SERVER_HEADLESS=true
   STREAMLIT_BROWSER_GATHER_USAGE_STATS=false
   ```
6. Click **Create Web Service**. Render will build the container and provide your live custom domain (e.g., `https://dark-store-command-center.onrender.com`).

---

## ☁️ 4. Deploying to AWS (AWS App Runner / ECS)

AWS App Runner provides fully managed container execution without needing to manage Kubernetes or EC2 instances.

### Step A: Push Image to Amazon ECR
```bash
# 1. Authenticate Docker with Amazon ECR (replace <account-id> and <region>)
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.ap-south-1.amazonaws.com

# 2. Create ECR repository
aws ecr create-repository --repository-name dark-store-app --region ap-south-1

# 3. Tag and push image
docker tag dark-store-app:latest <account-id>.dkr.ecr.ap-south-1.amazonaws.com/dark-store-app:latest
docker push <account-id>.dkr.ecr.ap-south-1.amazonaws.com/dark-store-app:latest
```

### Step B: Create AWS App Runner Service
1. Open the **AWS App Runner Console** and click **Create Service**.
2. Source: **Container registry** ➔ **Amazon ECR**.
3. Image URI: Select the image pushed above (`dark-store-app:latest`).
4. Deployment settings: **Automatic**.
5. Configure service:
   - **Port**: `8501`
   - **CPU / Memory**: `1 vCPU / 2 GB RAM`
6. Click **Create & Deploy**. AWS App Runner deploys the container behind a high-availability load balancer with automatic SSL.

---

## 🔒 Verification & Healthchecks

The container includes a built-in Docker health check:
```bash
# Verify health status from terminal
docker inspect --format='{{json .State.Health.Status}}' dark-store-streamlit
```
Output: `"healthy"`
