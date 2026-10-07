import { useState, useCallback, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChatMessage, ChatRequest, ChatResponse, Conversation } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface UseChatOptions {
  initialMessages?: ChatMessage[]
  initialModel?: string
  onMessage?: (message: ChatMessage) => void
  onError?: (error: string) => void
  onLoadingChange?: (isLoading: boolean) => void
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  currentModel: string
  conversationId: number | null
  sendMessage: (message: ChatMessage, conversationId?: number) => Promise<ChatResponse | null>
  startNewConversation: () => Promise<Conversation | null>
  continueConversation: (conversationId: number) => Promise<Conversation | null>
  clearMessages: () => void
  setModel: (modelId: string) => void
  cancelStream: () => void
}

export const useChat = (options: UseChatOptions = {}): UseChatReturn => {
  const {
    initialMessages = [],
    initialModel = 'llama-3-8b',
    onMessage,
    onError,
    onLoadingChange,
  } = options

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [currentModel, setCurrentModel] = useState<string>(initialModel)
  const [conversationId, setConversationId] = useState<number | null>(null)
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Update loading state callback
  useEffect(() => {
    onLoadingChange?.(isLoading)
  }, [isLoading, onLoadingChange])

  // Update error callback
  useEffect(() => {
    if (error) {
      onError?.(error)
    }
  }, [error, onError])

  // Update message callback
  useEffect(() => {
    if (messages.length > 0) {
      onMessage?.(messages[messages.length - 1])
    }
  }, [messages, onMessage])

  const getToken = (): string | null => {
    return localStorage.getItem('token')
  }

  const getHeaders = (): Record<string, string> => {
    const token = getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    }
  }

  const startNewConversation = useCallback(async (): Promise<Conversation | null> => {
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model_id: currentModel,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to create conversation')
        return null
      }

      const conversation = await response.json()
      setConversationId(conversation.id)
      setMessages([])
      
      // Invalidate conversations cache
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      
      return conversation
    } catch (err) {
      console.error('Failed to create conversation:', err)
      setError('Network error. Please try again.')
      return null
    }
  }, [currentModel, queryClient])

  const continueConversation = useCallback(async (conversationId: number): Promise<Conversation | null> => {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to load conversation')
        return null
      }

      const conversation = await response.json()
      setConversationId(conversation.id)
      
      // Load messages for this conversation
      const messagesResponse = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
        headers: getHeaders(),
      })

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json()
        const chatMessages: ChatMessage[] = messagesData.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }))
        setMessages(chatMessages)
      }
      
      return conversation
    } catch (err) {
      console.error('Failed to load conversation:', err)
      setError('Network error. Please try again.')
      return null
    }
  }, [queryClient])

  const sendMessage = useCallback(async (
    message: ChatMessage,
    conversationId?: number
  ): Promise<ChatResponse | null> => {
    setIsLoading(true)
    setError(null)

    try {
      // If no conversation ID, create a new one
      let targetConversationId = conversationId
      if (!targetConversationId) {
        const newConversation = await startNewConversation()
        targetConversationId = newConversation?.id
      }

      // Add user message to state
      setMessages(prev => [...prev, message])

      // Prepare request
      const request: ChatRequest = {
        model_id: currentModel,
        messages: [...messages, message],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false,
        conversation_id: targetConversationId,
      }

      // Cancel any ongoing request
      if (abortController) {
        abortController.abort()
      }

      const controller = new AbortController()
      setAbortController(controller)

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to send message')
        setIsLoading(false)
        return null
      }

      const chatResponse: ChatResponse = await response.json()
      
      // Add assistant message to state
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: chatResponse.content }
      ])

      // Update conversation ID if it was created
      if (chatResponse.conversation_id) {
        setConversationId(chatResponse.conversation_id)
      }

      // Invalidate conversations cache
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      if (targetConversationId) {
        queryClient.invalidateQueries({ 
          queryKey: ['conversation', targetConversationId] 
        })
      }

      setIsLoading(false)
      setAbortController(null)
      
      return chatResponse
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled
        setIsLoading(false)
        return null
      }
      
      console.error('Failed to send message:', err)
      setError('Network error. Please try again.')
      setIsLoading(false)
      return null
    }
  }, [messages, currentModel, startNewConversation, queryClient, abortController])

  const sendStreamingMessage = useCallback(async (
    message: ChatMessage,
    conversationId?: number
  ): Promise<void> => {
    setIsLoading(true)
    setError(null)

    try {
      // If no conversation ID, create a new one
      let targetConversationId = conversationId
      if (!targetConversationId) {
        const newConversation = await startNewConversation()
        targetConversationId = newConversation?.id
      }

      // Add user message to state
      setMessages(prev => [...prev, message])

      // Prepare request
      const request: ChatRequest = {
        model_id: currentModel,
        messages: [...messages, message],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true,
        conversation_id: targetConversationId,
      }

      // Cancel any ongoing request
      if (abortController) {
        abortController.abort()
      }

      const controller = new AbortController()
      setAbortController(controller)

      const response = await fetch(`${API_URL}/api/chat/stream`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to start stream')
        setIsLoading(false)
        return
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        setError('No response body')
        setIsLoading(false)
        return
      }

      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n\n')

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.substring(5).trim()
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              
              if (parsed.type === 'start') {
                // Stream started
                assistantMessage = ''
              } else if (parsed.type === 'chunk') {
                // Append chunk to assistant message
                assistantMessage += parsed.content
                
                // Update messages in state
                setMessages(prev => {
                  const newMessages = [...prev]
                  // Find and update the last assistant message, or add new one
                  const lastIndex = newMessages.length - 1
                  if (lastIndex >= 0 && newMessages[lastIndex].role === 'assistant') {
                    newMessages[lastIndex] = {
                      ...newMessages[lastIndex],
                      content: assistantMessage
                    }
                  } else {
                    newMessages.push({ role: 'assistant', content: assistantMessage })
                  }
                  return newMessages
                })
              } else if (parsed.type === 'done') {
                // Stream completed
                setConversationId(parsed.conversation_id)
                
                // Invalidate conversations cache
                queryClient.invalidateQueries({ queryKey: ['conversations'] })
                if (targetConversationId) {
                  queryClient.invalidateQueries({ 
                    queryKey: ['conversation', targetConversationId] 
                  })
                }
              } else if (parsed.type === 'error') {
                setError(parsed.message || 'Stream error')
              }
            } catch (err) {
              console.error('Failed to parse stream chunk:', err)
            }
          }
        }
      }

      setIsLoading(false)
      setAbortController(null)
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled
        setIsLoading(false)
        return
      }
      
      console.error('Streaming error:', err)
      setError('Network error. Please try again.')
      setIsLoading(false)
    }
  }, [messages, currentModel, startNewConversation, queryClient, abortController])

  const clearMessages = useCallback(() => {
    setMessages([])
    setConversationId(null)
    setError(null)
  }, [])

  const setModel = useCallback((modelId: string) => {
    setCurrentModel(modelId)
  }, [])

  const cancelStream = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    setIsLoading(false)
  }, [abortController])

  return {
    messages,
    isLoading,
    error,
    currentModel,
    conversationId,
    sendMessage,
    sendStreamingMessage,
    startNewConversation,
    continueConversation,
    clearMessages,
    setModel,
    cancelStream,
  }
}

export default useChat
