import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, User, Mail, Lock } from 'lucide-react'
import { useAuthContext } from './AuthProvider'

export const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  const { register } = useAuthContext()
  const navigate = useNavigate()

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!username.trim()) {
      newErrors.username = 'Usuário é obrigatório'
    } else if (username.length < 3) {
      newErrors.username = 'Usuário deve ter pelo menos 3 caracteres'
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    
    try {
      await register({ 
        username, 
        email, 
        password, 
        full_name: username 
      })
    } catch (error) {
      // Error is handled by AuthProvider
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Crie sua conta</h1>
        <p className="text-muted-foreground">
          Junte-se ao NexusMind AI e comece a conversar com IA
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-medium flex items-center">
            <User className="w-4 h-4 mr-2" />
            Usuário
          </label>
          <div className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu usuário"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.username ? 'border-red-500' : 'border-input'
              } bg-background text-foreground focus:outline-none focus:border-ring transition-colors`}
              required
              autoComplete="username"
              autoFocus
            />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu email"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-input'
              } bg-background text-foreground focus:outline-none focus:border-ring transition-colors`}
              required
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            Senha
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.password ? 'border-red-500' : 'border-input'
              } bg-background text-foreground focus:outline-none focus:border-ring transition-colors pr-12`}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            Confirmar Senha
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              className={`w-full px-4 py-3 rounded-lg border ${
                errors.confirmPassword ? 'border-red-500' : 'border-input'
              } bg-background text-foreground focus:outline-none focus:border-ring transition-colors pr-12`}
              required
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Ao criar uma conta, você concorda com nossos{' '}
          <a href="#" className="text-primary hover:underline">Termos de Serviço</a>{' '}
          e{' '}
          <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
        </p>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Criando conta...
            </>
          ) : (
            'Criar Conta'
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="text-primary hover:underline font-medium"
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  )
}

export default RegisterForm
