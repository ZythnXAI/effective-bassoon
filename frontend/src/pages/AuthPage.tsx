import React, { useEffect } from 'react'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { AuthForm } from '@/components/Auth'
import { useAuthContext } from '@/components/Auth/AuthProvider'

export const AuthPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')

  // Redirect to chat if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = (location.state as any)?.from?.pathname || '/chat'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, location])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-12 bg-gradient-to-br from-primary to-secondary text-white">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-white/20 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">NexusMind AI</h1>
          <p className="text-xl mb-8 max-w-md">
            Conecte-se a múltiplas inteligências artificiais em um só lugar
          </p>
          
          {/* Features */}
          <div className="space-y-2 text-left">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>Chat em tempo real</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>8+ APIs de IA integradas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>Histórico de conversas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <span>Interface moderna e intuitiva</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <AuthForm />
      </div>
    </div>
  )
}

export default AuthPage
