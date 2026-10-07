# Authentication API

## 🔐 Overview

O NexusMind AI usa autenticação baseada em JWT (JSON Web Tokens) para proteger seus endpoints. Todos os endpoints, exceto os públicos de saúde e documentação, requerem um token JWT válido.

## 📋 Endpoints

### Register User

Cria um novo usuário no sistema.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required)",
  "password": "string (required)",
  "full_name": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Usuário ou email já existe
- `422 Validation Error`: Dados inválidos

---

### Login

Autentica um usuário e retorna um token JWT.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Credenciais inválidas
- `422 Validation Error`: Dados inválidos

---

### Get Current User

Obtém informações do usuário autenticado.

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2024-01-01T00:00:00Z",
  "last_login": "2024-01-02T10:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Token inválido ou expirado

---

### Get User Stats

Obtém estatísticas do usuário.

**Endpoint:** `GET /api/auth/stats`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "total_conversations": 15,
  "total_messages": 150,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### Refresh Token

Renova o token de acesso.

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Error Responses:**
- `401 Unauthorized`: Token inválido

---

### Logout

Invalidar o token atual (client-side).

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully. Please remove the token from client storage."
}
```

---

## 🔑 JWT Token Structure

### Payload Example

```json
{
  "sub": "john_doe",
  "id": 1,
  "exp": 1735689600,
  "iat": 1735603200
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `sub` | string | Username |
| `id` | integer | User ID |
| `exp` | integer | Expiration timestamp |
| `iat` | integer | Issued at timestamp |

---

## ⏱️ Token Expiration

- **Default Expiration**: 24 hours (1440 minutes)
- **Refresh**: Can be refreshed before expiration
- **Auto-refresh**: Client-side implementation recommended

---

## 🔐 Security Best Practices

### Client-Side

```javascript
// Store token securely
localStorage.setItem('token', accessToken)

// Include in requests
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})

// Auto-refresh logic
setInterval(() => {
  // Refresh token before it expires
}, 20 * 60 * 1000) // 20 minutes
```

### Server-Side

```python
# Verify token
from fastapi import Depends, HTTPException
from jose import JWTError, jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

---

## 🛡️ Security Features

### Rate Limiting
- 100 requests per minute per user
- Adjustable via environment variables

### CORS
- Configured origins only
- Credentials allowed

### Input Validation
- Pydantic models for request validation
- Sanitization of user input

### Password Security
- Bcrypt hashing
- Minimum 6 characters
- Never stored in plain text

---

## 📞 Support

For authentication issues:
- Check your token expiration
- Verify token storage
- Ensure CORS is properly configured
- Contact: auth-support@nexusmind.ai
