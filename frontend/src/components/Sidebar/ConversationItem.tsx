import React from 'react'
import { MessageSquare, Star, MoreVertical, Trash2 } from 'lucide-react'
import { Conversation } from '@/types'
import { formatDate, getModelDisplayName, truncate } from '@/utils'
import { useConversations } from '@/hooks'

interface ConversationItemProps {
  conversation: Conversation
  onSelect: (conversation: Conversation) => void
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const { deleteConversation, toggleFavorite } = useConversations()

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await toggleFavorite(conversation.id)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Tem certeza que deseja excluir esta conversa?')) {
      await deleteConversation(conversation.id)
    }
  }

  return (
    <button
      onClick={() => onSelect(conversation)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full px-3 py-2 rounded-lg text-left text-sm transition-colors hover:bg-muted/50 group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">
                {conversation.title || 'Nova conversa'}
              </div>
              <div className="text-xs text-muted-foreground">
                {getModelDisplayName(conversation.model_id)} • {formatDate(conversation.updated_at)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={handleToggleFavorite}
            className={`p-1 rounded-lg transition-colors ${
              conversation.is_favorite 
                ? 'text-yellow-500 bg-yellow-500/10' 
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>
          
          {isHovered && (
            <>
              <button
                onClick={handleDelete}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted/50 hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button className="p-1 rounded-lg text-muted-foreground hover:bg-muted/50">
                <MoreVertical className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </button>
  )
}

export default ConversationItem
