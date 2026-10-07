# Installation Guide

## 🚀 Quick Install

The fastest way to get NexusMind AI running locally.

### Prerequisites

- [Docker](https://www.docker.com/) 20.10+
- [Docker Compose](https://docs.docker.com/compose/) 2.0+
- Git
- 4GB+ RAM (recommended)
- 2+ CPU cores (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/ZythnXAI/effective-bassoon.git
cd effective-bassoon
```

### 2. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit with your API keys
nano .env  # or use your preferred editor
```

### 3. Start Containers

```bash
docker-compose up -d
```

### 4. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## 📦 Manual Installation

For development or custom deployments.

### Backend Setup

#### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

#### 3. Configure Database

```bash
# SQLite (default)
python -c "from app.core.database import Base, engine; Base.metadata.create_all(bind=engine)"

# PostgreSQL (optional)
# Edit .env with your PostgreSQL connection string
```

#### 4. Run Server

```bash
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

#### 1. Install Dependencies

```bash
cd frontend
npm install
```

#### 2. Configure Environment

Edit `frontend/.env` or use environment variables:

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=NexusMind AI
VITE_APP_VERSION=1.0.0
```

#### 3. Run Development Server

```bash
npm run dev
```

#### 4. Build for Production

```bash
npm run build
npm run preview
```

---

## 🐳 Docker Deployment

### Production Deployment

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

### Custom Configuration

Edit `docker-compose.yml` for production settings:

```yaml
services:
  backend:
    environment:
      - SECRET_KEY=your-production-secret
      - DATABASE_URL=postgresql://user:pass@db:5432/nexusmind
    restart: always
  
  frontend:
    environment:
      - NODE_ENV=production
    restart: always
```

---

## 🌐 Cloud Deployment

### AWS ECS

```bash
# Build and push images
docker build -t nexusmind-backend -f backend/Dockerfile .
docker build -t nexusmind-frontend -f frontend/Dockerfile .

docker push nexusmind-backend
docker push nexusmind-frontend

# Deploy with ECS CLI
# (Configure your ECS cluster first)
```

### Google Cloud Run

```bash
# Backend
gcloud run deploy nexusmind-backend \
  --image nexusmind-backend \
  --port 8000 \
  --memory 2Gi \
  --cpu 2

# Frontend
gcloud run deploy nexusmind-frontend \
  --image nexusmind-frontend \
  --port 3000
```

### Azure Container Apps

```bash
# Create container apps
az containerapp create \
  --name nexusmind-backend \
  --image nexusmind-backend \
  --ports 8000

az containerapp create \
  --name nexusmind-frontend \
  --image nexusmind-frontend \
  --ports 3000
```

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel
```

---

## 🔧 Configuration

### Environment Variables

#### Backend

```bash
# Server
BACKEND_PORT=8000
BACKEND_HOST=0.0.0.0

# Security
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL=sqlite:///./nexusmind.db
# or
DATABASE_URL=postgresql://user:pass@localhost:5432/nexusmind

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:8000

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=60
```

#### AI API Keys

```bash
# E2B
E2B_API_KEY=your-key
E2B_BASE_URL=https://api.e2b.dev

# GROQ
GROQ_API_KEY=your-key
GROQ_BASE_URL=https://api.groq.com/v1

# Manus AI
MANUS_AI_API_KEY=your-key
MANUS_AI_BASE_URL=https://api.manus.ai

# Fal AI
FAL_AI_API_KEY=your-key
FAL_AI_BASE_URL=https://fal.run

# Exa AI
EXA_AI_API_KEY=your-key
EXA_AI_BASE_URL=https://api.exa.ai

# Daytona
DAYTONA_API_KEY=your-key
DAYTONA_BASE_URL=https://api.daytona.io

# BrowserBase
BROWSERBASE_API_KEY=your-key
BROWSERBASE_BASE_URL=https://api.browserbase.io

# NVIDIA NIM
NVIDIA_NIM_API_KEY=your-key
NVIDIA_NIM_BASE_URL=https://api.nim.nvidia.com
```

### Frontend

```bash
VITE_API_URL=http://localhost:8000
VITE_APP_NAME=NexusMind AI
VITE_APP_VERSION=1.0.0
```

---

## 🔍 Troubleshooting

### Common Issues

#### Docker Permissions

```bash
# Fix Docker permissions
sudo usermod -aG docker $USER
newgrp docker
```

#### Port Already in Use

```bash
# Find and kill process
sudo lsof -i :8000
kill -9 <PID>

# Or change ports in docker-compose.yml
```

#### Database Connection Issues

```bash
# For SQLite
chmod 666 backend/nexusmind.db

# For PostgreSQL
# Verify connection string and credentials
```

#### API Keys Not Working

```bash
# Verify keys are correct
# Check API provider status pages
# Test with curl
curl -H "Authorization: Bearer YOUR_KEY" \
  https://api.groq.com/v1/chat/completions \
  -d '{"model": "llama-3-8b", "messages": [{"role": "user", "content": "Hello"}]}'
```

---

## 📞 Support

- **Documentation**: https://docs.nexusmind.ai
- **GitHub Issues**: https://github.com/ZythnXAI/effective-bassoon/issues
- **Discord**: https://discord.gg/nexusmind
- **Email**: support@nexusmind.ai
