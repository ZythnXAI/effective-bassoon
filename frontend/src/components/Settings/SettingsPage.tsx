import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, User, Bell, Globe, Palette, Shield, Info, LogOut } from 'lucide-react'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useTheme } from '@/hooks'
import { ProfileSettings } from './ProfileSettings'
import { AppearanceSettings } from './AppearanceSettings'
import { NotificationSettings } from './NotificationSettings'
import { LanguageSettings } from './LanguageSettings'
import { PrivacySettings } from './PrivacySettings'
import { AboutSettings } from './AboutSettings'

type SettingsTab = 'profile' | 'appearance' | 'notifications' | 'language' | 'privacy' | 'about'

const settingsTabs = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'appearance', label: 'Aparência', icon: Palette },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'language', label: 'Idioma', icon: Globe },
  { id: 'privacy', label: 'Privacidade', icon: Shield },
  { id: 'about', label: 'Sobre', icon: Info },
]

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const { user, logout } = useAuthContext()
  const { theme, setTheme, isDark } = useTheme()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/auth')
  }

  const handleBack = () => {
    navigate('/chat')
  }

  return (
    <div className="flex-1 flex flex-col h-full p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={handleBack}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no NexusMind AI
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="space-y-1">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Logout button */}
          <div className="mt-6 pt-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl">
            {activeTab === 'profile' && <ProfileSettings user={user} />}
            {activeTab === 'appearance' && (
              <AppearanceSettings theme={theme} setTheme={setTheme} isDark={isDark} />
            )}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'language' && <LanguageSettings />}
            {activeTab === 'privacy' && <PrivacySettings />}
            {activeTab === 'about' && <AboutSettings />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
