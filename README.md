# NexusMind AI - Plataforma de IA Conversacional

## 🚀 Sobre o Projeto

NexusMind AI é uma plataforma de chat de IA completa, inspirada em DeepSeek e ChatGPT, que integra múltiplos modelos de linguagem e ferramentas de IA através de APIs de terceiros. A plataforma oferece uma interface moderna e intuitiva para interagir com diversos modelos de IA.

## 📋 Funcionalidades

- **Chat em tempo real** com múltiplos modelos de IA
- **Integração com 8+ APIs de IA** (E2B, Exa AI, Manus AI, GROQ, Fal AI, Daytona, BrowserBase, NVIDIA NIM)
- **Gerenciamento de conversas** (histórico, favoritos, exclusão)
- **Autenticação de usuários** (JWT-based)
- **Interface responsiva** (desktop e mobile)
- **Modo escuro/claro**
- **Suporte a Markdown** nas respostas
- **Streaming de respostas** para melhor UX

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
├─────────────────────────────────────────────────────────────┤
│  Components: Chat, Sidebar, Navbar, Settings, Auth           │
│  State Management: React Query + Context API                 │
│  Styling: Tailwind CSS + Custom CSS                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                        │
├─────────────────────────────────────────────────────────────┤
│  API Endpoints: /api/chat, /api/conversations, /api/auth     │
│  Services: AI Integration, Conversation Management, Auth      │
│  Database: SQLite (para conversas e usuários)                │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  E2B API     │ │  Exa AI API   │ │ Manus AI API  │
   └──────────────┘ └──────────────┘ └──────────────┘
   ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
   │  GROQ API    │ │  Fal AI API   │ │ Daytona API   │
   └──────────────┘ └──────────────┘ └──────────────┘
   ┌──────────────┐ ┌──────────────┐
   │BrowserBase API│ │ NVIDIA NIM    │
   └──────────────┘ └──────────────┘
```

## 🛠️ Tecnologias Utilizadas

### Backend
- **Python 3.11+**
- **FastAPI** - Framework web assíncrono
- **Uvicorn** - Server ASGI
- **SQLAlchemy** - ORM
- **Pydantic** - Validação de dados
- **JWT** - Autenticação
- **httpx** - Client HTTP assíncrono

### Frontend
- **React 18+** - Biblioteca de UI
- **TypeScript** - Tipagem estática
- **Vite** - Bundler
- **Tailwind CSS** - Framework CSS
- **React Query** - Gerenciamento de estado do servidor
- **React Markdown** - Renderização de Markdown
- **Framer Motion** - Animações

### Infraestrutura
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **SQLite** - Banco de dados (pode ser substituído por PostgreSQL)

## 📦 Estrutura do Projeto

```
effective-bassoon/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── chat.py
│   │   │   ├── conversations.py
│   │   │   └── models.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── base.py
│   │   │   ├── conversation.py
│   │   │   ├── message.py
│   │   │   └── user.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py
│   │   │   ├── conversation_service.py
│   │   │   └── user_service.py
│   │   └── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   │   └── logo.svg
│   │   ├── components/
│   │   │   ├── Chat/
│   │   │   ├── Sidebar/
│   │   │   ├── Navbar/
│   │   │   ├── Settings/
│   │   │   ├── Auth/
│   │   │   └── common/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Pré-requisitos
- Docker 20.10+
- Docker Compose 2.0+
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/ZythnXAI/effective-bassoon.git
cd effective-bassoon
```

### 2. Configure as variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e preencha com suas chaves de API:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas chaves (exemplo):
```env
# Backend
BACKEND_PORT=8000
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./nexusmind.db

# APIs de IA (substitua pelas suas chaves)
E2B_API_KEY=your-e2b-api-key
EXA_AI_API_KEY=your-exa-ai-api-key
MANUS_AI_API_KEY=your-manus-ai-api-key
GROQ_API_KEY=your-groq-api-key
FAL_AI_API_KEY=your-fal-ai-api-key
DAYTONA_API_KEY=your-daytona-api-key
BROWSERBASE_API_KEY=your-browserbase-api-key
NVIDIA_NIM_API_KEY=your-nvidia-nim-api-key

# Frontend
FRONTEND_PORT=3000
VITE_API_URL=http://localhost:8000
```

### 3. Inicie os containers
```bash
docker-compose up -d
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Docs da API**: http://localhost:8000/docs

## 🎨 Identidade Visual

### Logo
O logo do NexusMind AI representa a conexão entre múltiplas inteligências artificiais:
- **Formato**: Hexágono (simbolizando conexão e rede)
- **Cores**: Gradiente de azul (#3B82F6) para roxo (#8B5CF6)
- **Ícone**: Circuito neural estilizado

### Paleta de Cores
```
Primária:    #3B82F6 (Azul)
Secundária:  #8B5CF6 (Roxo)
Sucesso:     #10B981 (Verde)
Aviso:       #F59E0B (Amarelo)
Erro:        #EF4444 (Vermelho)
Fundo Escuro: #0F172A
Fundo Claro:  #F8FAFC
```

## 🔧 Configuração de Desenvolvimento

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou: venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📡 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registrar novo usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado

### Chat
- `POST /api/chat` - Enviar mensagem e receber resposta
- `GET /api/chat/models` - Listar modelos disponíveis

### Conversas
- `GET /api/conversations` - Listar conversas do usuário
- `POST /api/conversations` - Criar nova conversa
- `GET /api/conversations/{id}` - Obter conversa específica
- `DELETE /api/conversations/{id}` - Excluir conversa
- `PATCH /api/conversations/{id}/title` - Atualizar título

## 🤖 Modelos de IA Suportados

| API | Modelos | Descrição |
|-----|---------|-----------|
| E2B | e2b-code, e2b-chat | Modelos de código e chat |
| Exa AI | exa-search | Busca semântica |
| Manus AI | manus-v2 | Modelos de linguagem |
| GROQ | llama-3-8b, mixtral-8x7b | Modelos rápidos |
| Fal AI | fal-llm | Modelos de linguagem |
| Daytona | daytona-code | Execução de código |
| BrowserBase | browserbase-browser | Navegação web |
| NVIDIA NIM | nim-llama-3 | Modelos NVIDIA |

## 💡 Como Adicionar Novos Modelos

1. Adicione a chave de API no arquivo `.env`
2. Crie um novo cliente no arquivo `backend/app/services/ai_service.py`
3. Registre o modelo no dicionário `MODELS`
4. Reinicie o backend

## 🛡️ Segurança

- **CORS**: Configurado para permitir apenas origens específicas
- **Rate Limiting**: Limite de requisições por usuário
- **JWT**: Tokens com expiração de 24 horas
- **Validação de Input**: Sanitização de entradas
- **HTTPS**: Recomendado para produção

## 📊 Monitoramento

- **Logs**: Estruturados com JSON
- **Métricas**: Prometheus (opcional)
- **Health Check**: `/api/health`

## 🎯 Roadmap

- [x] Backend FastAPI com autenticação
- [x] Frontend React com interface de chat
- [x] Integração com todas as APIs de IA
- [x] Streaming de respostas
- [x] Gerenciamento de conversas
- [ ] Busca semântica com Exa AI
- [ ] Execução de código com Daytona
- [ ] Navegação web com BrowserBase
- [ ] Deploy em produção
- [ ] CI/CD automatizado

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - Sinta-se à vontade para usar, modificar e distribuir.

## 🙏 Agradecimentos

- FastAPI - Framework web incrível
- React - Biblioteca de UI poderosa
- Tailwind CSS - CSS utilitário
- Todas as APIs de IA por possibilitar esta integração

---

**NexusMind AI** - Conectando você a múltiplas inteligências artificiais.

🌐 [Website](#) | 📧 [Email](#) | 🐦 [Twitter](#)
