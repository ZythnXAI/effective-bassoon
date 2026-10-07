# Quick Start Guide

## ⚡ Get Started in 5 Minutes

Follow these simple steps to start using NexusMind AI.

---

## 🎯 Step 1: Clone the Repository

```bash
git clone https://github.com/ZythnXAI/effective-bassoon.git
cd effective-bassoon
```

---

## 📝 Step 2: Configure Environment

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
nano .env
```

### Required API Keys

You need at least one API key to use NexusMind AI. We recommend starting with **GROQ** as it's fast and free:

```bash
# Get a free API key from https://groq.com
GROQ_API_KEY=your-groq-api-key-here
```

### Full Configuration Example

```bash
# Backend
BACKEND_PORT=8000
SECRET_KEY=your-secret-key-change-in-production
DATABASE_URL=sqlite:///./nexusmind.db

# AI APIs (add at least one)
GROQ_API_KEY=your-groq-api-key
E2B_API_KEY=your-e2b-api-key
EXA_AI_API_KEY=your-exa-ai-api-key
MANUS_AI_API_KEY=your-manus-ai-api-key
FAL_AI_API_KEY=your-fal-ai-api-key
DAYTONA_API_KEY=your-daytona-api-key
BROWSERBASE_API_KEY=your-browserbase-api-key
NVIDIA_NIM_API_KEY=your-nvidia-nim-api-key

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:8000
```

> **💡 Tip**: You can get free API keys from most providers. Start with GROQ for the best free tier.

---

## 🐳 Step 3: Start the Application

```bash
docker-compose up -d
```

This will:
- Build the backend and frontend images
- Start the containers
- Create the database
- Make the application available

---

## 🌐 Step 4: Access the Application

Open your browser and navigate to:

- **💬 Chat Interface**: http://localhost:3000
- **🔌 API Documentation**: http://localhost:8000/docs
- **📡 API Endpoint**: http://localhost:8000

---

## 🚀 Step 5: Start Chatting

### Create an Account

1. Go to http://localhost:3000
2. Click "Register" or "Create Account"
3. Fill in your details
4. You're ready to chat!

### Send Your First Message

1. Select a model from the dropdown (e.g., `llama-3-8b`)
2. Type your message in the input box
3. Press Enter or click the send button
4. Wait for the AI response

---

## 🎨 Customize Your Experience

### Change Theme

Click the theme toggle button in the top-right corner to switch between:
- 🌙 Dark mode
- ☀️ Light mode
- 💻 System preference

### Select Different Models

Try different AI models from the model selector:
- **Llama 3 8B** (GROQ) - Fast and versatile
- **Mixtral 8x7B** (GROQ) - High performance
- **E2B Chat** - Code-focused
- **Manus v2** - Advanced conversations

### Create Multiple Conversations

- Click "New Chat" to start a fresh conversation
- Switch between conversations in the sidebar
- Favorite important conversations with the star icon
- Search your conversation history

---

## 💡 First Things to Try

### 1. Basic Chat

```
User: Hello, how are you?
AI: I'm doing great! How can I help you today?
```

### 2. Code Generation

```
User: Write a Python function to calculate Fibonacci sequence
AI: Here's a Python function for Fibonacci...
```

### 3. Multi-Turn Conversation

```
User: What's the capital of France?
AI: The capital of France is Paris.

User: What's its population?
AI: As of 2024, Paris has approximately 2.1 million inhabitants...
```

### 4. Model Comparison

Try the same prompt with different models to see how they respond differently.

---

## 🎯 Advanced Features

### Semantic Search

Use the search endpoint to find information:

```bash
curl -X POST http://localhost:8000/api/chat/search \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "latest AI research", "num_results": 5}'
```

### Code Execution

Execute Python code directly:

```bash
curl -X POST http://localhost:8000/api/chat/execute \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code": "print(2+2)", "language": "python"}'
```

### Web Browsing

Browse the web through the AI:

```bash
curl -X POST http://localhost:8000/api/chat/browse \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## 🔧 Troubleshooting

### Application Won't Start

```bash
# Check container logs
docker-compose logs -f

# Restart containers
docker-compose down && docker-compose up -d
```

### API Keys Not Working

1. Verify your API keys are correct
2. Check if you've reached your rate limit
3. Test the API directly with curl
4. Visit the provider's status page

### Can't Access Frontend

```bash
# Check if frontend is running
docker ps

# Restart frontend only
docker-compose restart frontend
```

---

## 📚 Next Steps

Now that you're up and running, explore:

- [📖 Full Documentation](https://github.com/ZythnXAI/effective-bassoon/tree/main/docs)
- [🔌 API Reference](https://github.com/ZythnXAI/effective-bassoon/blob/main/docs/api/reference.md)
- [🏗️ Architecture Overview](https://github.com/ZythnXAI/effective-bassoon/blob/main/docs/guides/architecture.md)
- [🤝 Contributing Guide](https://github.com/ZythnXAI/effective-bassoon/blob/main/.github/CONTRIBUTING.md)

---

## 💬 Get Help

- **💬 Discord**: [Join our community](https://discord.gg/nexusmind)
- **🐛 Issues**: [Report bugs](https://github.com/ZythnXAI/effective-bassoon/issues)
- **📧 Email**: support@nexusmind.ai
- **📚 Docs**: [Full documentation](https://docs.nexusmind.ai)

---

## 🎉 You're Ready!

Start exploring NexusMind AI and discover the power of multi-AI conversations!

**Happy Chatting! 🤖**
