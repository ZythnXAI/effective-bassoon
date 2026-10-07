import { useState, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { LoginCredentials, RegisterCredentials, AuthResponse, UserResponse } from '@/types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

export const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const isAuthenticated = !!token

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        setToken(storedToken)
        await fetchUser(storedToken)
      }
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const fetchUser = async (token: string): Promise<UserResponse | null> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          setToken(null)
          setUser(null)
        }
        return null
      }

      const data = await response.json()
      setUser(data)
      return data
    } catch (err) {
      console.error('Failed to fetch user:', err)
      setError('Failed to fetch user')
      return null
    }
  }

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail || 'Login failed')
        setIsLoading(false)
        return false
      }

      const data: AuthResponse = await response.json()
      localStorage.setItem('token', data.access_token)
      setToken(data.access_token)
      
      // Fetch user data
      await fetchUser(data.access_token)
      
      setIsLoading(false)
      return true
    } catch (err) {
      console.error('Login error:', err)
      setError('Network error. Please try again.')
      setIsLoading(false)
      return false
    }
  }, [])

  const register = useCallback(async (credentials: RegisterCredentials): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.detail || 'Registration failed')
        setIsLoading(false)
        return false
      }

      const data: UserResponse = await response.json()
      
      // Auto-login after registration
      const loginSuccess = await login({
        username: credentials.username,
        password: credentials.password,
      })

      setIsLoading(false)
      return loginSuccess
    } catch (err) {
      console.error('Registration error:', err)
      setError('Network error. Please try again.')
      setIsLoading(false)
      return false
    }
  }, [login])

  const logout = useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      setError(null)
      
      // Clear all queries
      queryClient.clear()
    }
  }, [token, queryClient])

  const getUser = useCallback(async (): Promise<UserResponse | null> => {
    if (!token) return null
    return await fetchUser(token)
  }, [token])

  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!token) return false

    try {
      const response = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        await logout()
        return false
      }

      const data: AuthResponse = await response.json()
      localStorage.setItem('token', data.access_token)
      setToken(data.access_token)
      await fetchUser(data.access_token)
      
      return true
    } catch (err) {
      console.error('Token refresh error:', err)
      await logout()
      return false
    }
  }, [token, logout])

  // Auto-refresh token before it expires (every 20 minutes)
  useEffect(() => {
    if (!token) return

    const interval = setInterval(() => {
      refreshToken()
    }, 20 * 60 * 1000) // 20 minutes

    return () => clearInterval(interval)
  }, [token, refreshToken])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    getUser,
    refreshToken,
  }
}

export default useAuth
