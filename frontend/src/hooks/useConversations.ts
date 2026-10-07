import { useState, useCallback, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Conversation, ConversationListResponse } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const getHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  }
}

export const useConversations = () => {
  const queryClient = useQueryClient()

  // Fetch all conversations
  const { data, isLoading, error, refetch } = useQuery<ConversationListResponse>({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to fetch conversations')
      }

      return response.json()
    },
    enabled: !!localStorage.getItem('token'),
  })

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (modelId: string) => {
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ model_id: modelId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Delete a conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      return true
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Update conversation (title, favorite)
  const updateConversationMutation = useMutation({
    mutationFn: async ({ 
      conversationId, 
      title, 
      is_favorite 
    }: { 
      conversationId: number 
      title?: string 
      is_favorite?: boolean 
    }) => {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ title, is_favorite }),
      })

      if (!response.ok) {
        throw new Error('Failed to update conversation')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}/favorite`, {
        method: 'POST',
        headers: getHeaders(),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })

  // Get conversation by ID
  const getConversationById = useCallback(async (conversationId: number): Promise<Conversation | null> => {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        return null
      }

      return response.json()
    } catch (err) {
      console.error('Failed to fetch conversation:', err)
      return null
    }
  }, [])

  // Get messages for a conversation
  const getMessages = useCallback(async (conversationId: number): Promise<any[] | null> => {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}/messages`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.messages
    } catch (err) {
      console.error('Failed to fetch messages:', err)
      return null
    }
  }, [])

  // Get conversation stats
  const getConversationStats = useCallback(async (conversationId: number): Promise<any | null> => {
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversationId}/stats`, {
        headers: getHeaders(),
      })

      if (!response.ok) {
        return null
      }

      return response.json()
    } catch (err) {
      console.error('Failed to fetch conversation stats:', err)
      return null
    }
  }, [])

  return {
    conversations: data?.conversations || [],
    total: data?.total || 0,
    isLoading,
    error,
    refetch,
    createConversation: createConversationMutation.mutateAsync,
    deleteConversation: deleteConversationMutation.mutateAsync,
    updateConversation: updateConversationMutation.mutateAsync,
    toggleFavorite: toggleFavoriteMutation.mutateAsync,
    getConversationById,
    getMessages,
    getConversationStats,
  }
}

export default useConversations
