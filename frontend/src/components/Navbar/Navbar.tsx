import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, User, Settings, Sun, Moon, Monitor, Sparkles } from 'lucide-react'
import { useAuthContext } from '@/components/Auth/AuthProvider'
import { useTheme } from '@/hooks'
import { Avatar, AvatarFallback } from './Avatar'

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthContext()
  const { theme, setTheme, isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const isAuthPage = location.pathname === '/auth'

  if (isAuthPage) return null

  const handleLogout = async () => {
    await logout()
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  const handleProfile = () => {
    // In a real app, this would navigate to profile page
    navigate('/settings')
  }

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }

  const getThemeIcon = () => {
    if (theme === 'light') return <Sun className="w-4 h-4" />
    if (theme === 'dark') return <Moon className="w-4 h-4" />
    return <Monitor className="w-4 h-4" />
  }

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="hidden lg:flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">NexusMind AI</span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title={`Tema: ${theme}`}
          >
            {getThemeIcon()}
          </button>

          {/* Settings */}
          <button
            onClick={handleSettings}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User menu */}
          {user && (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleProfile}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar>
                  <AvatarFallback>
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">{user.username}</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Sair"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
