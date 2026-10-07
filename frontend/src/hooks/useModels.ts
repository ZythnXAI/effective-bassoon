import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ModelInfo, ModelConfig } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

export const useModels = () => {
  // Fetch all available models
  const { data, isLoading, error, refetch } = useQuery<ModelInfo[]>({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/models`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }

      const data = await response.json()
      return data.models
    },
  })

  // Get model by ID
  const getModelById = useCallback((modelId: string): ModelInfo | undefined => {
    return data?.find(model => model.id === modelId)
  }, [data])

  // Get models by provider
  const getModelsByProvider = useCallback((provider: string): ModelInfo[] => {
    return data?.filter(model => model.provider === provider) || []
  }, [data])

  // Get models by type
  const getModelsByType = useCallback((type: string): ModelInfo[] => {
    return data?.filter(model => model.type === type) || []
  }, [data])

  // Get all providers
  const getProviders = useCallback((): string[] => {
    const providers = data?.map(model => model.provider) || []
    return [...new Set(providers)]
  }, [data])

  // Get all types
  const getTypes = useCallback((): string[] => {
    const types = data?.map(model => model.type) || []
    return [...new Set(types)]
  }, [data])

  // Get default model
  const getDefaultModel = useCallback((): ModelInfo | undefined => {
    return data?.find(model => model.id === 'llama-3-8b') || data?.[0]
  }, [data])

  // Get chat models only
  const getChatModels = useCallback((): ModelInfo[] => {
    return data?.filter(model => model.type === 'chat' && model.supports_streaming) || []
  }, [data])

  // Get code models
  const getCodeModels = useCallback((): ModelInfo[] => {
    return data?.filter(model => model.type === 'code' || model.type === 'code_execution') || []
  }, [data])

  // Get search models
  const getSearchModels = useCallback((): ModelInfo[] => {
    return data?.filter(model => model.type === 'search') || []
  }, [data])

  return {
    models: data || [],
    isLoading,
    error,
    refetch,
    getModelById,
    getModelsByProvider,
    getModelsByType,
    getProviders,
    getTypes,
    getDefaultModel,
    getChatModels,
    getCodeModels,
    getSearchModels,
  }
}

export default useModels
