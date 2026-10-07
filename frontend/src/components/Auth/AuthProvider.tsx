import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { 
  UserResponse, 
  LoginCredentials, 
  RegisterCredentials,
  AuthResponse 
} from '@/types'
import { useAuth as useAuthHook } from '@/hooks'

interface AuthContextType {
  user: UserResponse | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (credentials: RegisterCredentials) => Promise<boolean>
  logout: () => Promise<void>
  getUser: () => Promise<UserResponse | null>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthHook()
  const navigate = useNavigate()
  const [initialLoad, setInitialLoad] = useState(true)

  // Sync auth state with navigation
  useEffect(() => {
    if (!initialLoad) return
    
    if (auth.isAuthenticated) {
      navigate('/chat')
    } else {
      navigate('/auth')
    }
    
    setInitialLoad(false)
  }, [auth.isAuthenticated, navigate, initialLoad])

  // Show error messages
  useEffect(() => {
    if (auth.error) {
      toast.error(auth.error)
      auth.error = null // Reset error after showing
    }
  }, [auth.error])

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    const success = await auth.login(credentials)
    if (success) {
      toast.success(`Bem-vindo, ${auth.user?.username}!`)
      navigate('/chat')
    }
    return success
  }, [auth, navigate])

  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    const success = await auth.register(credentials)
    if (success) {
      toast.success('Registro realizado com sucesso!')
      navigate('/chat')
    }
    return success
  }, [auth, navigate])

  const logout = useCallback(async (): Promise<void> => {
    await auth.logout()
    toast.success('Logout realizado com sucesso')
    navigate('/auth')
  }, [auth, navigate])

  const value: AuthContextType = {
    ...auth,
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
