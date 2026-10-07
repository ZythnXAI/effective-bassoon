# Chat API

## 💬 Overview

A Chat API permite interagir com múltiplos modelos de IA de forma unificada. Suporta tanto requisições síncronas quanto streaming em tempo real.

## 📋 Endpoints

### List Models

Lista todos os modelos de IA disponíveis.

**Endpoint:** `GET /api/chat/models`

**Response (200 OK):**
```json
{
  "models": [
    {
      "id": "llama-3-8b",
      "name": "Llama 3 8B",
      "provider": "groq",
      "type": "chat",
      "supports_streaming": true
    },
    {
      "id": "mixtral-8x7b",
      "name": "Mixtral 8x7B",
      "provider": "groq",
      "type": "chat",
      "supports_streaming": true
    },
    {
      "id": "e2b-chat",
      "name": "E2B Chat",
      "provider": "e2b",
      "type": "chat",
      "supports_streaming": true
    }
  ],
  "count": 8
}
```

---

### Get Model Info

Obtém informações detalhadas de um modelo específico.

**Endpoint:** `GET /api/chat/models/{model_id}`

**Response (200 OK):**
```json
{
  "id": "llama-3-8b",
  "name": "Llama 3 8B",
  "provider": "groq",
  "type": "chat",
  "supports_streaming": true
}
```

**Error Responses:**
- `404 Not Found`: Modelo não encontrado

---

### Send Message (Non-Streaming)

Envía uma mensagem e recebe uma resposta completa.

**Endpoint:** `POST /api/chat/`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "model_id": "llama-3-8b",
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": false,
  "conversation_id": 1
}
```

**Response (200 OK):**
```json
{
  "id": "msg_123456789",
  "model_id": "llama-3-8b",
  "content": "I'm doing great! How can I help you today?",
  "role": "assistant",
  "finish_reason": "stop",
  "created_at": "2024-01-01T10:00:00Z",
  "latency_ms": 1200,
  "token_count": 15,
  "conversation_id": 1
}
```

**Request Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `model_id` | string | No | "llama-3-8b" | ID do modelo a ser usado |
| `messages` | array | Yes | - | Lista de mensagens no formato {role, content} |
| `temperature` | number | No | 0.7 | Temperatura de amostragem (0.0-2.0) |
| `max_tokens` | integer | No | 2000 | Máximo de tokens a gerar |
| `stream` | boolean | No | false | Se deve usar streaming |
| `conversation_id` | integer | No | null | ID da conversa para continuar |

---

### Send Message (Streaming)

Envía uma mensagem e recebe uma resposta em streaming (SSE).

**Endpoint:** `POST /api/chat/stream`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "model_id": "llama-3-8b",
  "messages": [
    {
      "role": "user",
      "content": "Tell me a story"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 2000,
  "stream": true
}
```

**Response:** Server-Sent Events (SSE) stream

```
data: {"type": "start", "model_id": "llama-3-8b", "conversation_id": 1}

data: {"type": "chunk", "content": "Once"}

data: {"type": "chunk", "content": " upon"}

data: {"type": "chunk", "content": " a time"}

data: {"type": "done", "conversation_id": 1, "latency_ms": 2500}
```

**Stream Event Types:**

| Type | Description | Data |
|------|-------------|------|
| `start` | Stream iniciado | model_id, conversation_id |
| `chunk` | Chunk de conteúdo | content |
| `done` | Stream concluído | conversation_id, latency_ms |
| `error` | Erro ocorrido | message |

---

### Semantic Search

Realiza busca semântica usando Exa AI.

**Endpoint:** `POST /api/chat/search`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "query": "latest AI research",
  "num_results": 5,
  "start_date": "2024-01-01",
  "end_date": "2024-10-07"
}
```

**Response (200 OK):**
```json
{
  "query": "latest AI research",
  "results": [
    {
      "id": "abc123",
      "title": "New AI Breakthrough",
      "url": "https://example.com/ai-breakthrough",
      "description": "Description of the article",
      "score": 0.95,
      "published_date": "2024-10-01"
    }
  ],
  "count": 5
}
```

---

### Execute Code

Executa código usando Daytona API.

**Endpoint:** `POST /api/chat/execute`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python",
  "timeout": 30
}
```

**Response (200 OK):**
```json
{
  "output": "Hello, World!\n",
  "error": null,
  "execution_time": 0.5,
  "exit_code": 0
}
```

---

### Browse Web

Navega em uma URL usando BrowserBase API.

**Endpoint:** `POST /api/chat/browse`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://example.com",
  "action": "visit",
  "timeout": 30
}
```

**Response (200 OK):**
```json
{
  "content": "<html>...</html>",
  "url": "https://example.com",
  "title": "Example Domain",
  "screenshot": "base64-encoded-image"
}
```

---

## 🎯 Supported Models

### Chat Models

| Model ID | Provider | Name | Streaming | Description |
|----------|----------|------|-----------|-------------|
| `llama-3-8b` | GROQ | Llama 3 8B | ✅ | Fast, general-purpose |
| `mixtral-8x7b` | GROQ | Mixtral 8x7B | ✅ | High performance |
| `gemma-7b` | GROQ | Gemma 7B | ✅ | Lightweight |
| `e2b-chat` | E2B | E2B Chat | ✅ | Code-focused |
| `manus-v2` | Manus | Manus v2 | ✅ | Advanced chat |
| `fal-llm` | Fal | Fal LLM | ✅ | Creative writing |
| `nim-llama-3` | NVIDIA | NVIDIA Llama 3 | ✅ | GPU-optimized |

### Special Models

| Model ID | Provider | Type | Description |
|----------|----------|------|-------------|
| `e2b-code` | E2B | Code | Code generation |
| `daytona-code` | Daytona | Code Execution | Run code |
| `exa-search` | Exa AI | Search | Semantic search |
| `browserbase-browser` | BrowserBase | Web Browsing | Browse web |

---

## 💡 Examples

### Basic Chat

```javascript
const response = await fetch('/api/chat/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model_id: 'llama-3-8b',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
})

const data = await response.json()
console.log(data.content)
```

### Streaming Chat

```javascript
const response = await fetch('/api/chat/stream', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer <token>',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model_id: 'llama-3-8b',
    messages: [{ role: 'user', content: 'Tell me a story' }],
    stream: true
  })
})

const reader = response.body.getReader()
const decoder = new TextDecoder()

while (true) {
  const { done, value } = await reader.read()
  if (done) break
  
  const chunk = decoder.decode(value)
  const lines = chunk.split('\n\n')
  
  for (const line of lines) {
    if (line.startsWith('data:')) {
      const data = JSON.parse(line.substring(5))
      if (data.type === 'chunk') {
        console.log(data.content)
      }
    }
  }
}
```

### Multi-Turn Conversation

```javascript
let conversationId = null

// First message
const response1 = await fetch('/api/chat/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model_id: 'llama-3-8b',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
})

conversationId = (await response1.json()).conversation_id

// Second message (continuing conversation)
const response2 = await fetch('/api/chat/', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer <token>', 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model_id: 'llama-3-8b',
    messages: [
      { role: 'user', content: 'Hello!' },
      { role: 'assistant', content: 'Hi there! How can I help you?' }
    ],
    conversation_id: conversationId
  })
})
```

---

## 📊 Rate Limits

- **Default**: 100 requests per minute
- **Streaming**: No additional limit
- **Code Execution**: 10 executions per minute
- **Web Browsing**: 5 browses per minute

---

## 🔗 Related

- [Authentication](authentication.md)
- [Conversations API](conversations.md)
- [Models API](models.md)
