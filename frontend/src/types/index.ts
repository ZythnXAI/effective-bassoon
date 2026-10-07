// AI Model Types
export interface ModelInfo {
  id: string
  name: string
  provider: string
  type: 'chat' | 'code' | 'search' | 'web_browsing' | 'code_execution'
  supports_streaming: boolean
}

// Message Types
export interface Message {
  id: number
  conversation_id: number
  role: 'user' | 'assistant' | 'system'
  content: string
  model_id?: string
  is_streaming: boolean
  token_count?: number
  latency_ms?: number
  created_at: string
}

// Conversation Types
export interface Conversation {
  id: number
  user_id: number
  title?: string
  model_id: string
  is_favorite: boolean
  created_at: string
  updated_at: string
  messages?: Message[]
}

// User Types
export interface User {
  id: number
  username: string
  email: string
  full_name?: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
  last_login?: string
}

// Auth Types
export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterCredentials {
  username: string
  email: string
  password: string
  full_name?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface UserResponse {
  id: number
  username: string
  email: string
  full_name?: string
  is_active: boolean
  is_superuser: boolean
  created_at: string
}

// Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatRequest {
  model_id?: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  conversation_id?: number
}

export interface ChatResponse {
  id: string
  model_id: string
  content: string
  role: 'assistant'
  finish_reason?: string
  created_at: string
  latency_ms?: number
  token_count?: number
  conversation_id?: number
}

// Streaming Types
export interface StreamChunk {
  type: 'start' | 'chunk' | 'done' | 'error'
  content?: string
  model_id?: string
  conversation_id?: number
  latency_ms?: number
  message?: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Conversation Stats
export interface ConversationStats {
  id: number
  title?: string
  model_id: string
  message_count: number
  created_at: string
  updated_at: string
  is_favorite: boolean
}

// User Stats
export interface UserStats {
  username: string
  email: string
  full_name?: string
  total_conversations: number
  total_messages: number
  created_at: string
}

// Model Config
export interface ModelConfig {
  id: string
  name: string
  provider: string
  type: string
  supports_streaming: boolean
}

// Conversation List Response
export interface ConversationListResponse {
  conversations: Conversation[]
  total: number
  limit: number
  offset: number
}

// Message List Response
export interface MessageListResponse {
  messages: Message[]
  conversation_id: number
  total: number
}

// Search Types
export interface SearchResult {
  id: string
  title: string
  url: string
  description: string
  score: number
  published_date?: string
}

// Code Execution Types
export interface CodeExecutionRequest {
  code: string
  language?: string
  timeout?: number
}

export interface CodeExecutionResponse {
  output: string
  error?: string
  execution_time: number
  exit_code: number
}

// Web Browsing Types
export interface BrowseRequest {
  url: string
  action?: string
  timeout?: number
}

export interface BrowseResponse {
  content: string
  url: string
  title?: string
  screenshot?: string
}

// UI State Types
export interface ChatState {
  messages: ChatMessage[]
  isLoading: boolean
  error?: string
  currentModel: string
  conversationId?: number
}

export interface SidebarState {
  isOpen: boolean
  conversations: Conversation[]
  selectedConversationId?: number
  searchQuery: string
}

export interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  fontSize: 'small' | 'medium' | 'large'
  model: string
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system'

// Toast Types
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}
