import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Plus, 
  MessageSquare, 
  History, 
  Star, 
  Settings, 
  LogOut,
  Menu,
  X,
  Sparkles
} from 'lucide-react'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useConversations, useModels } from '@/hooks'
import { Conversation } from '@/types'
import { ConversationItem } from './ConversationItem'
import { ModelSelector } from './ModelSelector'

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'favorites'>('all')
  
  const { logout, isAuthenticated } = useAuthContext()
  const { conversations, isLoading, refetch } = useConversations()
  const { models, getDefaultModel } = useModels()
  const navigate = useNavigate()
  const location = useLocation()

  // Filter conversations based on search and active tab
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.model_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = activeTab === 'all' || (activeTab === 'favorites' && conv.is_favorite)
    return matchesSearch && matchesTab
  })

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  // Create new chat
  const handleNewChat = () => {
    navigate('/chat')
    setIsMobileOpen(false)
    // The chat page will handle creating a new conversation
  }

  // Select conversation
  const handleSelectConversation = (conversation: Conversation) => {
    navigate(`/chat?conversationId=${conversation.id}`)
    setIsMobileOpen(false)
  }

  // Logout
  const handleLogout = async () => {
    await logout()
    setIsMobileOpen(false)
  }

  // Navigate to settings
  const handleSettings = () => {
    navigate('/settings')
    setIsMobileOpen(false)
  }

  // Refresh conversations
  useEffect(() => {
    if (isAuthenticated) {
      refetch()
    }
  }, [isAuthenticated, refetch])

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  if (!isAuthenticated) return null

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button
        onClick={toggleMobileSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-background border border-input hover:bg-muted transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 lg:z-auto lg:relative lg:translate-x-0 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col bg-background border-r border-border lg:w-64 w-72">
          {/* Sidebar header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg hidden lg:inline">NexusMind</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-muted transition-colors lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New chat button */}
          <button
            onClick={handleNewChat}
            className="m-3 btn btn-primary w-[calc(100%-1.5rem)] justify-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nova Conversa
          </button>

          {/* Model selector */}
          <div className="px-3 pb-3">
            <ModelSelector models={models} defaultModel={getDefaultModel()} />
          </div>

          {/* Conversation tabs */}
          <div className="px-3 py-2 flex space-x-1 border-b border-border">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeTab === 'all' 
                  ? 'bg-muted text-foreground' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <History className="w-4 h-4 inline mr-1" />
              Todas
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                activeTab === 'favorites' 
                  ? 'bg-muted text-foreground' 
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <Star className="w-4 h-4 inline mr-1" />
              Favoritas
            </button>
          </div>

          {/* Conversation search */}
          <div className="px-3 py-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando conversas...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {activeTab === 'favorites' 
                  ? 'Nenhuma conversa favoritada' 
                  : 'Nenhuma conversa ainda'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    onSelect={handleSelectConversation}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar footer */}
          <div className="p-3 border-t border-border space-y-1">
            <button
              onClick={handleSettings}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for desktop sidebar toggle */}
      {!isOpen && (
        <div
          className="hidden lg:block fixed left-0 top-0 w-4 h-full z-40 cursor-e-resize"
          onMouseDown={toggleSidebar}
        />
      )}
    </>
  )
}

export default Sidebar
