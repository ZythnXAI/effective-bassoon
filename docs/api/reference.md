# NexusMind AI - API Reference

## 📡 Base URL

```
Production: https://api.nexusmind.ai
Staging: https://staging-api.nexusmind.ai
Local: http://localhost:8000
```

## 🔐 Authentication

Todas as requisições (exceto endpoints públicos) requerem um token JWT no header:

```
Authorization: Bearer <token>
```

Veja [Authentication](authentication.md) para mais detalhes.

---

## 📋 Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check básico |
| GET | `/api/health/ready` | Readiness check |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registrar novo usuário |
| POST | `/api/auth/login` | Login e obter token |
| GET | `/api/auth/me` | Dados do usuário logado |
| GET | `/api/auth/stats` | Estatísticas do usuário |
| POST | `/api/auth/refresh` | Refresh token |
| POST | `/api/auth/logout` | Logout |

### Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/models` | Listar modelos disponíveis |
| GET | `/api/chat/models/{model_id}` | Informações de um modelo |
| POST | `/api/chat/` | Enviar mensagem (non-streaming) |
| POST | `/api/chat/stream` | Enviar mensagem (streaming) |
| POST | `/api/chat/search` | Busca semântica |
| POST | `/api/chat/execute` | Executar código |
| POST | `/api/chat/browse` | Navegar na web |

### Conversations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations/` | Listar todas as conversas |
| POST | `/api/conversations/` | Criar nova conversa |
| GET | `/api/conversations/{id}` | Obter conversa específica |
| PATCH | `/api/conversations/{id}` | Atualizar conversa |
| DELETE | `/api/conversations/{id}` | Excluir conversa |
| GET | `/api/conversations/{id}/messages` | Listar mensagens |
| POST | `/api/conversations/{id}/favorite` | Alternar favorito |
| GET | `/api/conversations/{id}/stats` | Estatísticas da conversa |

### Models

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/models/` | Listar todos os modelos |
| GET | `/api/models/{model_id}` | Detalhes de um modelo |
| GET | `/api/models/providers` | Listar providers |
| GET | `/api/models/providers/{provider}` | Modelos por provider |
| GET | `/api/models/types` | Listar tipos de modelos |
| GET | `/api/models/types/{type}` | Modelos por tipo |

---

## 📊 Rate Limiting

- **Limite padrão**: 100 requisições por minuto
- **Headers de rate limit**:
  - `X-RateLimit-Limit`: Limite máximo
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp de reset

---

## 🔧 Error Codes

### 4xx Errors

| Code | Description | Solution |
|------|-------------|----------|
| 400 | Bad Request | Verifique os parâmetros da requisição |
| 401 | Unauthorized | Token inválido ou expirado |
| 403 | Forbidden | Sem permissão para o recurso |
| 404 | Not Found | Recurso não encontrado |
| 422 | Validation Error | Dados inválidos |
| 429 | Too Many Requests | Rate limit excedido |

### 5xx Errors

| Code | Description | Solution |
|------|-------------|----------|
| 500 | Internal Server Error | Erro interno do servidor |
| 501 | Not Implemented | Funcionalidade não implementada |
| 502 | Bad Gateway | Erro no gateway |
| 503 | Service Unavailable | Serviço temporariamente indisponível |

---

## 📄 Response Format

Todas as respostas seguem o formato:

```json
{
  "data": { ... },
  "error": null,
  "message": "Success"
}
```

Para erros:

```json
{
  "data": null,
  "error": "Error message",
  "message": "Error description"
}
```

---

## 🔍 Examples

### Authentication

```bash
# Login
curl -X POST https://api.nexusmind.ai/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "user", "password": "pass"}'

# Get user info
curl -X GET https://api.nexusmind.ai/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Chat

```bash
# Send message
curl -X POST https://api.nexusmind.ai/api/chat/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "llama-3-8b",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7
  }'

# Stream message
curl -X POST https://api.nexusmind.ai/api/chat/stream \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model_id": "llama-3-8b",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": true
  }'
```

### Conversations

```bash
# List conversations
curl -X GET https://api.nexusmind.ai/api/conversations/ \
  -H "Authorization: Bearer <token>"

# Create conversation
curl -X POST https://api.nexusmind.ai/api/conversations/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"model_id": "llama-3-8b"}'
```

---

## 📚 SDKs

### JavaScript/TypeScript

```typescript
import { NexusMindClient } from '@nexusmind/client'

const client = new NexusMindClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.nexusmind.ai'
})

// Chat
const response = await client.chat({
  model: 'llama-3-8b',
  messages: [{ role: 'user', content: 'Hello!' }]
})

// Conversations
const conversations = await client.conversations.list()
```

### Python

```python
from nexusmind import NexusMindClient

client = NexusMindClient(api_key='your-api-key')

# Chat
response = client.chat(
  model='llama-3-8b',
  messages=[{'role': 'user', 'content': 'Hello!'}]
)

# Conversations
conversations = client.conversations.list()
```

---

## 🔗 Webhooks

### Events

| Event | Description | Payload |
|-------|-------------|---------|
| `conversation.created` | Nova conversa criada | Conversation object |
| `conversation.updated` | Conversa atualizada | Conversation object |
| `conversation.deleted` | Conversa excluída | Conversation ID |
| `message.created` | Nova mensagem | Message object |
| `user.registered` | Novo usuário | User object |

### Configuration

```bash
# Set webhook URL
curl -X POST https://api.nexusmind.ai/api/webhooks/ \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-webhook-url.com"}'

# List webhooks
curl -X GET https://api.nexusmind.ai/api/webhooks/ \
  -H "Authorization: Bearer <token>"
```

---

## 📞 Support

- **Documentation**: https://docs.nexusmind.ai
- **API Status**: https://status.nexusmind.ai
- **Discord**: https://discord.gg/nexusmind
- **Email**: api-support@nexusmind.ai
