import React, { useRef, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Send, Sparkles, Loader2, StopCircle } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useChat, useModels } from '@/hooks'
import { ChatMessage } from '@/types'
import { getModelDisplayName, truncate } from '@/utils'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatInput } from './ChatInput'

export const ChatContainer: React.FC = () => {
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()
  
  const { isAuthenticated } = useAuthContext()
  const { models, getDefaultModel } = useModels()
  const {
    messages,
    isLoading,
    error,
    currentModel,
    conversationId,
    sendStreamingMessage,
    startNewConversation,
    continueConversation,
    clearMessages,
    setModel,
    cancelStream,
  } = useChat()

  // Get conversation ID from URL
  const searchParams = new URLSearchParams(location.search)
  const conversationIdParam = searchParams.get('conversationId')

  // Load conversation on mount
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }

    if (conversationIdParam) {
      continueConversation(Number(conversationIdParam))
    } else {
      startNewConversation()
    }
  }, [isAuthenticated, conversationIdParam, navigate, continueConversation, startNewConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Set default model on mount
  useEffect(() => {
    const defaultModel = getDefaultModel()
    if (defaultModel && currentModel !== defaultModel.id) {
      setModel(defaultModel.id)
    }
  }, [getDefaultModel, currentModel, setModel])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    const newMessage: ChatMessage = {
      role: 'user',
      content: message.trim(),
    }

    // Clear input
    setMessage('')

    // Send message
    await sendStreamingMessage(newMessage, conversationId || undefined)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleNewChat = () => {
    clearMessages()
    navigate('/chat')
  }

  const handleModelChange = (modelId: string) => {
    setModel(modelId)
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">
            Por favor, faça login para usar o chat
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full relative">
      {/* Chat header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleNewChat}
            className="p-2 rounded-lg hover:bg-muted transition-colors lg:hidden"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">NexusMind AI</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isLoading && (
            <button
              onClick={cancelStream}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Parar resposta"
            >
              <StopCircle className="w-5 h-5" />
            </button>
          )}
          
          {/* Model selector for mobile */}
          <select
            value={currentModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="px-3 py-1 rounded-lg border border-input bg-background text-sm lg:hidden"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id}>
                {getModelDisplayName(model.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao NexusMind AI</h2>
            <p className="text-muted-foreground mb-4">
              Inicie uma conversa com uma de nossas IAs
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {models.slice(0, 4).map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-background transition-colors"
                >
                  {getModelDisplayName(model.id)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <ChatMessageBubble
                key={index}
                message={msg}
                isLoading={isLoading && index === messages.length - 1 && msg.role === 'assistant'}
              />
            ))}
            
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="chat-bubble chat-bubble-assistant">
                  <div className="loading-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="chat-bubble chat-bubble-assistant bg-red-500/10 border border-red-500/20">
                  <p className="text-red-500">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border bg-background/80 backdrop-blur-sm">
        <ChatInput
          message={message}
          setMessage={setMessage}
          onSend={handleSendMessage}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
          currentModel={currentModel}
          models={models}
          onModelChange={handleModelChange}
        />
      </div>
    </div>
  )
}

export default ChatContainer
