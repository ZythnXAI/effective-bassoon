import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, Sparkles } from 'lucide-react'
import { ModelInfo } from '@/types'
import { getModelDisplayName, getProviderIcon } from '@/utils'

interface ModelSelectorProps {
  models: ModelInfo[]
  defaultModel?: ModelInfo
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  defaultModel,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<ModelInfo | undefined>(defaultModel)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Filter models based on search query
  const filteredModels = models.filter((model) => {
    const query = searchQuery.toLowerCase()
    return (
      model.id.toLowerCase().includes(query) ||
      model.name.toLowerCase().includes(query) ||
      model.provider.toLowerCase().includes(query)
    )
  })

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Group models by provider
  const modelsByProvider: Record<string, ModelInfo[]> = {}
  filteredModels.forEach((model) => {
    if (!modelsByProvider[model.provider]) {
      modelsByProvider[model.provider] = []
    }
    modelsByProvider[model.provider].push(model)
  })

  const handleSelectModel = (model: ModelInfo) => {
    setSelectedModel(model)
    setIsOpen(false)
    setSearchQuery('')
    // In a real implementation, this would update the current model in the chat
    localStorage.setItem('selectedModel', model.id)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-input bg-background text-sm hover:bg-muted transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getProviderIcon(selectedModel?.provider || '')}</span>
          <span>
            {selectedModel ? getModelDisplayName(selectedModel.id) : 'Selecione um modelo'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* Search input */}
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar modelos..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-ring"
              autoFocus
            />
          </div>

          {/* Model list */}
          <div className="p-1">
            {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
              <div key={provider} className="py-1">
                <div className="px-3 py-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {provider}
                </div>
                {providerModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelectModel(model)}
                    className={`w-full px-3 py-2 text-left text-sm rounded-lg transition-colors flex items-center justify-between hover:bg-muted/50 ${
                      selectedModel?.id === model.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span>{getProviderIcon(model.provider)}</span>
                      <span>{model.name}</span>
                    </div>
                    {selectedModel?.id === model.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            ))}

            {filteredModels.length === 0 && (
              <div className="p-3 text-center text-sm text-muted-foreground">
                Nenhum modelo encontrado
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector
