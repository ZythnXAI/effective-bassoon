import React from 'react'
import { ChatContainer } from '@/components/Chat'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useNavigate } from 'react-router-dom'

export const ChatPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthContext()
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    navigate('/auth')
    return null
  }

  return <ChatContainer />
}

export default ChatPage
