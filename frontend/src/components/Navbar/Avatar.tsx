import React from 'react'
import { User } from 'lucide-react'
import { useAuthContext } from '@/components/Auth/AuthProvider'

interface AvatarProps {
  className?: string
  children?: React.ReactNode
}

export const Avatar: React.FC<AvatarProps> = ({ className, children }) => {
  const { user } = useAuthContext()

  return (
    <div
      className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${className || ''}`}
    >
      {children || (
        <User className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  )
}

interface AvatarFallbackProps {
  children?: React.ReactNode
}

export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ children }) => {
  return (
    <span className="text-sm font-medium text-foreground">
      {children}
    </span>
  )
}

export default Avatar
