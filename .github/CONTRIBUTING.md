# Guia de Contribuição do NexusMind AI

Primeiramente, obrigado por considerar contribuir para o NexusMind AI! 🎉

## 🚀 Começando

### Pré-requisitos

- Git
- Docker e Docker Compose
- Node.js 20+ (para desenvolvimento frontend)
- Python 3.11+ (para desenvolvimento backend)

### Instalação

1. **Fork o repositório**
   ```bash
   git clone https://github.com/ZythnXAI/effective-bassoon.git
   cd effective-bassoon
   ```

2. **Configure o ambiente**
   ```bash
   cp .env.example .env
   # Edite .env com suas chaves de API
   ```

3. **Inicie os containers**
   ```bash
   docker-compose up -d
   ```

4. **Acesse a aplicação**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - Docs: http://localhost:8000/docs

## 📝 Como Contribuir

### Reportando Bugs

1. Verifique se o bug já foi reportado em [Issues](https://github.com/ZythnXAI/effective-bassoon/issues)
2. Crie uma nova issue usando o template [Bug Report](https://github.com/ZythnXAI/effective-bassoon/issues/new?template=bug_report.md)
3. Inclua:
   - Descrição clara do bug
   - Passos para reproduzir
   - Comportamento esperado
   - Screenshots (se aplicável)
   - Informações do ambiente

### Sugerindo Novas Funcionalidades

1. Verifique se a feature já foi sugerida em [Issues](https://github.com/ZythnXAI/effective-bassoon/issues)
2. Crie uma nova issue usando o template [Feature Request](https://github.com/ZythnXAI/effective-bassoon/issues/new?template=feature_request.md)
3. Inclua:
   - Descrição clara da feature
   - Problema que resolve
   - Alternativas consideradas
   - Prioridade sugerida

### Contribuindo com Código

1. **Crie uma branch**
   ```bash
   git checkout -b feature/nova-feature
   ```

2. **Faça suas alterações**
   - Siga as [Diretrizes de Código](#diretrizes-de-código)
   - Adicione testes para novas funcionalidades
   - Atualize a documentação

3. **Commit suas alterações**
   ```bash
   git add .
   git commit -m "feat: adiciona nova feature"
   ```

4. **Push para o fork**
   ```bash
   git push origin feature/nova-feature
   ```

5. **Abra um Pull Request**
   - Use o template [Pull Request](https://github.com/ZythnXAI/effective-bassoon/compare)
   - Descreva suas alterações
   - Relacione com issues existentes

## 📋 Diretrizes de Código

### Backend (Python/FastAPI)

- Siga [PEP 8](https://peps.python.org/pep-0008/)
- Use type hints
- Docstrings para funções públicas
- Nomes descritivos para variáveis e funções
- Mantenedores:
  - @ZythnXAI

### Frontend (React/TypeScript)

- Use TypeScript
- Siga as melhores práticas React
- Componentes reutilizáveis
- Hooks personalizados para lógica complexa
- Estilos com Tailwind CSS
- Mantenedores:
  - @ZythnXAI

### Commits

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Alterações na documentação
- `style:` - Alterações de estilo
- `refactor:` - Refatoração de código
- `perf:` - Melhorias de performance
- `test:` - Adição de testes
- `chore:` - Outras alterações

## 🧪 Testes

### Backend

```bash
cd backend
pytest tests/ --cov=app --cov-report=html
```

### Frontend

```bash
cd frontend
npm run lint
npm run type-check
npm test
```

## 📚 Documentação

- Mantenha a documentação atualizada
- Adicione docstrings para novas funções
- Atualize o README.md com novas funcionalidades
- Documente endpoints da API

## 🎯 Roadmap

Veja nosso [Roadmap](https://github.com/ZythnXAI/effective-bassoon#roadmap) no README principal.

## 🤝 Código de Conduta

Leia nosso [Código de Conduta](https://github.com/ZythnXAI/effective-bassoon/blob/main/.github/CODE_OF_CONDUCT.md) antes de contribuir.

## 🙏 Agradecimentos

Obrigado por ajudar a melhorar o NexusMind AI! Juntos, estamos construindo a próxima geração de plataformas de IA.

---

**NexusMind AI** - Conectando você a múltiplas inteligências artificiais.
