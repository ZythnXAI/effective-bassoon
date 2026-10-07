import React from 'react'
import { SettingsPage as SettingsComponent } from '@/components/Settings'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useNavigate } from 'react-router-dom'

export const SettingsPage: React.FC = () => {
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

  return <SettingsComponent />
}

export default SettingsPage
