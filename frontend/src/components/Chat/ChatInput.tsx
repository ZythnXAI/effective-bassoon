import React, { useRef, useState } from 'react'
import { Send, Sparkles, Paperclip, Mic, Code, Search, Webhook } from 'lucide-react'
import { ModelInfo } from '@/types'
import { getModelDisplayName, getProviderIcon } from '@/utils'

interface ChatInputProps {
  message: string
  setMessage: (message: string) => void
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  isLoading: boolean
  currentModel: string
  models: ModelInfo[]
  onModelChange: (modelId: string) => void
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  setMessage,
  onSend,
  onKeyDown,
  isLoading,
  currentModel,
  models,
  onModelChange,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  const handleResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  useEffect(() => {
    handleResize()
  }, [message])

  const handleModelChange = (modelId: string) => {
    onModelChange(modelId)
    setShowModelSelector(false)
  }

  const selectedModel = models.find(m => m.id === currentModel)

  return (
    <div className="relative">
      {/* Model selector (desktop) */}
      <div className="hidden lg:flex absolute left-0 bottom-full mb-2">
        <div className="flex items-center space-x-2 bg-background border border-input rounded-lg px-3 py-2">
          <span className="text-lg">{selectedModel ? getProviderIcon(selectedModel.provider) : '⚡'}</span>
          <select
            value={currentModel}
            onChange={(e) => handleModelChange(e.target.value)}
            className="bg-transparent border-none outline-none text-foreground text-sm"
          >
            {models.map((model) => (
              <option key={model.id} value={model.id} className="bg-background text-foreground">
                {getModelDisplayName(model.id)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Input container */}
      <div className={`flex items-end space-x-2 bg-background border border-input rounded-xl p-2 transition-colors ${
        isFocused ? 'border-ring shadow-sm' : ''
      }`}>
        {/* Left buttons */}
        <div className="flex space-x-1">
          <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Anexar arquivo">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-lg hover:bg-muted transition-colors" title="Usar voz">
            <Mic className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isLoading ? "Aguarde..." : "Digite sua mensagem aqui... (Ctrl+Enter para nova linha, Enter para enviar)"}
            className="w-full bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground py-2 px-1 min-h-[44px] max-h-[200px]"
            rows={1}
            disabled={isLoading}
          />
          
          {/* Character count */}
          {message.length > 0 && (
            <div className="absolute right-2 bottom-2 text-xs text-muted-foreground">
              {message.length}
            </div>
          )}
        </div>

        {/* Right buttons */}
        <div className="flex space-x-1">
          <button
            onClick={onSend}
            disabled={!message.trim() || isLoading}
            className={`p-2 rounded-lg transition-colors ${
              !message.trim() || isLoading 
                ? 'text-muted-foreground cursor-not-allowed' 
                : 'hover:bg-muted text-foreground cursor-pointer'
            }`}
            title="Enviar mensagem"
          >
            {isLoading ? (
              <div className="w-5 h-5 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
              </div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Quick actions (mobile) */}
      <div className="lg:hidden mt-2 flex justify-center space-x-2">
        <button
          onClick={() => handleModelChange('llama-3-8b')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            currentModel === 'llama-3-8b' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground hover:bg-background'
          }`}
        >
          Llama 3
        </button>
        <button
          onClick={() => handleModelChange('mixtral-8x7b')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            currentModel === 'mixtral-8x7b' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground hover:bg-background'
          }`}
        >
          Mixtral
        </button>
        <button
          onClick={() => handleModelChange('e2b-chat')}
          className={`px-3 py-1 text-sm rounded-full transition-colors ${
            currentModel === 'e2b-chat' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-foreground hover:bg-background'
          }`}
        >
          E2B
        </button>
      </div>

      {/* Mobile model selector */}
      {showModelSelector && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-lg p-4 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Selecione um modelo</h3>
              <button onClick={() => setShowModelSelector(false)} className="text-muted-foreground">
                Fechar
              </button>
            </div>
            <div className="space-y-2">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentModel === model.id 
                      ? 'bg-muted' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{getProviderIcon(model.provider)}</span>
                    <span>{getModelDisplayName(model.id)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatInput
