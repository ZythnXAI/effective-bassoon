# Architecture Overview

## 🏗️ System Architecture

NexusMind AI follows a modern, scalable architecture designed for performance, reliability, and extensibility.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐          │
│  │   Web Browser   │  │   Mobile App    │  │   Desktop App   │          │
│  │   (React)       │  │   (React Native)│  │   (Electron)    │          │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘          │
└───────────┼──────────────────────┼──────────────────────┼──────────────┘
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   │ HTTPS/WS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    FastAPI Backend                              │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │    │
│  │  │   Auth       │  │   Chat       │  │ Conversations │         │    │
│  │  │   Service    │  │   Service    │  │   Service     │         │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │    │
│  │                                                                  │    │
│  │  ┌─────────────────────────────────────────────────────────┐    │    │
│  │  │                    AI Integration Layer                    │    │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │    │
│  │  │  │  E2B     │ │  GROQ    │ │ Manus    │ │  Fal     │   │    │    │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │    │    │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │    │    │
│  │  │  │ Exa AI   │ │ Daytona  │ │BrowserBase│ │ NVIDIA   │   │    │    │
│  │  │  └──────────┘ └──────────┘ └──────────┘ │  NIM     │   │    │    │
│  │  │                                             └──────────┘   │    │    │
│  │  └─────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        SQLite / PostgreSQL                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │    │
│  │  │   Users      │  │ Conversations │  │   Messages    │         │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Technology Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Core Language |
| FastAPI | 0.109+ | Web Framework |
| SQLAlchemy | 2.0+ | ORM |
| Pydantic | 2.5+ | Data Validation |
| JWT | 3.3+ | Authentication |
| httpx | 0.26+ | HTTP Client |
| SQLite | 3+ | Database (default) |
| PostgreSQL | 13+ | Database (production) |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI Framework |
| TypeScript | 5.3+ | Type Safety |
| Vite | 5+ | Build Tool |
| Tailwind CSS | 3.4+ | Styling |
| React Query | 5+ | Data Fetching |
| React Markdown | 9+ | Markdown Rendering |
| Framer Motion | 11+ | Animations |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Orchestration |
| GitHub Actions | CI/CD |
| Nginx | Reverse Proxy (optional) |

---

## 🏛️ Backend Architecture

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py          # App initialization
│   ├── main.py              # FastAPI app setup
│   │
│   ├── api/                 # API Routers
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── chat.py          # Chat endpoints
│   │   ├── conversations.py # Conversation management
│   │   ├── models.py        # Model information
│   │   └── health.py        # Health checks
│   │
│   ├── core/               # Core Utilities
│   │   ├── __init__.py
│   │   ├── config.py        # Settings & configuration
│   │   ├── database.py      # Database connection
│   │   └── security.py      # JWT & password hashing
│   │
│   ├── models/              # Database Models
│   │   ├── __init__.py
│   │   ├── base.py          # Base model
│   │   ├── user.py          # User model
│   │   ├── conversation.py  # Conversation model
│   │   ├── message.py       # Message model
│   │   └── model_config.py  # Model configuration
│   │
│   └── services/            # Business Logic
│       ├── __init__.py
│       ├── ai_service.py    # AI integration
│       ├── conversation_service.py
│       └── user_service.py
│
├── requirements.txt         # Python dependencies
├── Dockerfile               # Docker configuration
└── .env.example              # Environment template
```

### API Layer

The backend exposes a RESTful API with the following characteristics:

- **Authentication**: JWT-based with Bearer tokens
- **Rate Limiting**: 100 requests/minute by default
- **CORS**: Configurable allowed origins
- **Validation**: Pydantic models for request/response
- **Error Handling**: Standardized error responses
- **Streaming**: Server-Sent Events (SSE) support

### AI Integration Layer

The `AIService` class handles all AI provider integrations:

```python
class AIService:
    # Provider handlers
    - _groq_chat()
    - _e2b_chat()
    - _manus_chat()
    - _fal_chat()
    - _nvidia_nim_chat()
    
    # Special services
    - exa_search()
    - daytona_execute()
    - browserbase_browse()
```

Each provider has:
- Dedicated HTTP client
- API key management
- Request/response transformation
- Error handling
- Streaming support (where available)

---

## 🎨 Frontend Architecture

### Directory Structure

```
frontend/
├── public/                  # Static files
│   └── favicon.svg
│
├── src/
│   ├── assets/              # Static assets
│   │   ├── logo.svg
│   │   └── favicon.svg
│   │
│   ├── components/          # React Components
│   │   ├── Auth/           # Authentication components
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   │
│   │   ├── Chat/           # Chat components
│   │   │   ├── ChatContainer.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── ChatMessageBubble.tsx
│   │   │
│   │   ├── Navbar/         # Navigation
│   │   │   ├── Navbar.tsx
│   │   │   └── Avatar.tsx
│   │   │
│   │   ├── Sidebar/        # Side navigation
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ConversationItem.tsx
│   │   │   └── ModelSelector.tsx
│   │   │
│   │   ├── Settings/       # Settings pages
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── ProfileSettings.tsx
│   │   │   ├── AppearanceSettings.tsx
│   │   │   └── ...
│   │   │
│   │   └── common/         # Shared components
│   │       ├── Layout.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── Card.tsx
│   │
│   ├── hooks/               # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useChat.ts
│   │   ├── useConversations.ts
│   │   ├── useModels.ts
│   │   └── useTheme.ts
│   │
│   ├── pages/               # Page Components
│   │   ├── ChatPage.tsx
│   │   ├── AuthPage.tsx
│   │   └── SettingsPage.tsx
│   │
│   ├── styles/              # CSS Styles
│   │   ├── index.css       # Custom styles
│   │   └── tailwind.css    # Tailwind imports
│   │
│   ├── types/               # TypeScript Types
│   │   └── index.ts
│   │
│   ├── utils/               # Utility Functions
│   │   ├── index.ts
│   │   └── cn.ts
│   │
│   ├── App.tsx             # Main App Component
│   └── main.tsx            # Entry Point
│
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── Dockerfile
```

### State Management

- **React Query**: Server state management
- **Context API**: Global state (auth, theme)
- **Local State**: useState for component state
- **URL State**: React Router for navigation state

### Component Hierarchy

```
App
├── AuthProvider
│   └── Router
│       ├── Layout
│       │   ├── Navbar
│       │   ├── Sidebar
│       │   └── Main Content
│       │       ├── ChatPage
│       │       │   └── ChatContainer
│       │       │       ├── ChatMessageBubble (xN)
│       │       │       └── ChatInput
│       │       ├── AuthPage
│       │       │   └── AuthForm
│       │       └── SettingsPage
│       └── ProtectedRoute
└── Toaster (for notifications)
```

---

## 🗃️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│      User       │       │   ModelConfig    │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │       │ id (PK)         │
│ username        │       │ model_id        │
│ email           │       │ name            │
│ hashed_password │       │ provider        │
│ full_name       │       │ description     │
│ is_active       │       │ supports_chat   │
│ is_superuser    │       │ supports_code   │
│ created_at      │       │ ...             │
│ last_login      │       └─────────────────┘
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐       ┌─────────────────┐
│   Conversation   │       │     Message      │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │◄──────│ id (PK)         │
│ user_id (FK)    │ 1:N   │ conversation_id │
│ title           │       │ role            │
│ model_id        │       │ content         │
│ is_favorite     │       │ model_id        │
│ created_at      │       │ is_streaming    │
│ updated_at      │       │ token_count     │
└─────────────────┘       │ latency_ms      │
                           │ created_at      │
                           └─────────────────┘
```

### Models

#### User
- **id**: Integer (Primary Key)
- **username**: String (Unique)
- **email**: String (Unique)
- **hashed_password**: String
- **full_name**: String (Nullable)
- **is_active**: Boolean (Default: True)
- **is_superuser**: Boolean (Default: False)
- **created_at**: DateTime
- **updated_at**: DateTime
- **last_login**: DateTime (Nullable)

#### Conversation
- **id**: Integer (Primary Key)
- **user_id**: Integer (Foreign Key → User)
- **title**: String (Nullable)
- **model_id**: String
- **is_favorite**: Boolean (Default: False)
- **created_at**: DateTime
- **updated_at**: DateTime

#### Message
- **id**: Integer (Primary Key)
- **conversation_id**: Integer (Foreign Key → Conversation)
- **role**: Enum ('user', 'assistant', 'system')
- **content**: Text
- **model_id**: String (Nullable)
- **is_streaming**: Boolean (Default: False)
- **token_count**: Integer (Nullable)
- **latency_ms**: Integer (Nullable)
- **created_at**: DateTime

#### ModelConfig
- **id**: Integer (Primary Key)
- **model_id**: String (Unique)
- **name**: String
- **provider**: String
- **description**: Text (Nullable)
- **supports_chat**: Boolean (Default: True)
- **supports_code**: Boolean (Default: False)
- **supports_image**: Boolean (Default: False)
- **supports_streaming**: Boolean (Default: True)
- **is_active**: Boolean (Default: True)
- **is_default**: Boolean (Default: False)

---

## 🔄 Data Flow

### Chat Message Flow

```
1. User sends message via frontend
   ↓
2. Frontend sends POST /api/chat/ with message
   ↓
3. Backend validates request and token
   ↓
4. Backend routes to AIService
   ↓
5. AIService selects provider handler (e.g., GROQ)
   ↓
6. Provider handler sends request to AI API
   ↓
7. AI API returns response
   ↓
8. Backend saves message to database
   ↓
9. Backend returns response to frontend
   ↓
10. Frontend displays message to user
```

### Streaming Flow

```
1. User sends message with stream=true
   ↓
2. Backend initiates streaming connection
   ↓
3. AI API streams chunks
   ↓
4. Backend forwards chunks to frontend via SSE
   ↓
5. Frontend receives and displays chunks in real-time
   ↓
6. Stream completes
   ↓
7. Backend saves complete message to database
```

---

## 🔐 Security Architecture

### Authentication Flow

```
1. User submits credentials
   ↓
2. Backend verifies password with bcrypt
   ↓
3. Backend generates JWT token
   ↓
4. Token includes: user_id, username, exp, iat
   ↓
5. Frontend stores token in localStorage
   ↓
6. Token sent in Authorization header for all requests
   ↓
7. Backend validates token on each request
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| **Authentication** | JWT with HS256 algorithm |
| **Password Hashing** | bcrypt with 12 rounds |
| **Rate Limiting** | 100 requests/minute per user |
| **CORS** | Configurable allowed origins |
| **Input Validation** | Pydantic models |
| **SQL Injection** | SQLAlchemy ORM |
| **XSS Protection** | Output encoding + CSP |
| **CSRF Protection** | JWT-based auth |
| **HTTPS** | Required in production |

---

## 🚀 Performance Considerations

### Backend Optimizations

- **Async/Await**: Full async support with FastAPI
- **Connection Pooling**: HTTP client pooling for AI APIs
- **Caching**: Model configs cached in memory
- **Streaming**: Efficient chunked responses
- **Compression**: Gzip compression for responses

### Frontend Optimizations

- **Code Splitting**: Dynamic imports for large components
- **Lazy Loading**: React.lazy for non-critical components
- **Memoization**: useMemo and useCallback for expensive computations
- **Virtualization**: Virtual scrolling for long lists
- **Debouncing**: Input debouncing for search

### Database Optimizations

- **Indexing**: Proper indexes on foreign keys and search fields
- **Pagination**: Limit and offset for large queries
- **Batch Operations**: Bulk inserts where possible
- **Connection Pooling**: SQLAlchemy connection pool

---

## 📊 Monitoring & Observability

### Metrics

- **Request Count**: Total requests per endpoint
- **Response Time**: Average response time
- **Error Rate**: Errors per endpoint
- **Active Users**: Concurrent users
- **Token Usage**: Tokens generated per model

### Logging

- **Format**: JSON structured logs
- **Levels**: DEBUG, INFO, WARNING, ERROR
- **Fields**: timestamp, level, message, context
- **Storage**: Console + File (optional)

### Health Checks

- **Liveness**: `/api/health/`
- **Readiness**: `/api/health/ready`
- **Database**: Connection check
- **AI APIs**: Provider connectivity check

---

## 🏗️ Scalability

### Horizontal Scaling

- **Backend**: Stateless design, can scale horizontally
- **Frontend**: Static build, can be served from CDN
- **Database**: PostgreSQL supports read replicas
- **AI APIs**: External services, no scaling needed

### Vertical Scaling

- **Backend**: Increase CPU/RAM for more concurrent requests
- **Frontend**: N/A (static files)
- **Database**: Increase resources for better query performance

### Caching Strategy

| Layer | Cache Type | TTL |
|-------|------------|-----|
| Backend | Model configs | Forever |
| Backend | AI responses | Configurable |
| Frontend | API responses | 5 minutes |
| Frontend | Static assets | 1 year |

---

## 🔧 Deployment Architecture

### Development Environment

```
┌─────────────┐     ┌─────────────┐
│   Docker    │────▶│   Localhost  │
│  Containers │     │   Browser   │
└─────────────┘     └─────────────┘
```

### Production Environment

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Internet  │────▶│   Load       │────▶│   Backend    │
└─────────────┘     │   Balancer   │     │  (FastAPI)   │
                      └─────────────┘     └─────────────┘
                            │                     │
                            ▼                     ▼
                      ┌─────────────┐     ┌─────────────┐
                      │   Frontend  │     │  Database   │
                      │   (Static)  │     │ (PostgreSQL)│
                      └─────────────┘     └─────────────┘
```

### High Availability

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Internet  │────▶│   Load       │────▶│   Backend    │
└─────────────┘     │   Balancer   │     │  Instance 1  │
                      └─────────────┘     └─────────────┘
                            │                     │
                            ▼                     ▼
                      ┌─────────────┐     ┌─────────────┐
                      │   Frontend  │     │   Backend    │
                      │   (CDN)     │     │  Instance 2  │
                      └─────────────┘     └─────────────┘
                                            │
                                            ▼
                                      ┌─────────────┐
                                      │  Database   │
                                      │ (Replicated)│
                                      └─────────────┘
```

---

## 📈 Future Architecture Improvements

### Planned Enhancements

1. **Microservices**: Split backend into separate services
   - Auth Service
   - Chat Service
   - API Gateway
   - User Service

2. **Message Queue**: For async processing
   - RabbitMQ / Kafka
   - Background jobs
   - Webhook notifications

3. **Cache Layer**: Redis for frequently accessed data
   - Conversation caching
   - Model config caching
   - Rate limiting

4. **Search Engine**: Elasticsearch for conversation search
   - Full-text search
   - Semantic search
   - Fuzzy search

5. **Analytics Service**: Dedicated analytics pipeline
   - Usage metrics
   - User behavior
   - Performance monitoring

---

## 📚 Additional Resources

- [Development Setup](development.md)
- [Deployment Guide](deployment.md)
- [API Reference](../api/reference.md)
- [Backend Details](backend.md)
- [Frontend Details](frontend.md)
