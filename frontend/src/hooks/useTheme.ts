import { useState, useEffect, useCallback } from 'react'
import { Theme } from '@/types'

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>('system')

  // Initialize theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null
    if (storedTheme) {
      setThemeState(storedTheme)
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setThemeState(prefersDark ? 'dark' : 'light')
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Apply new theme
    if (theme === 'light') {
      root.classList.add('light')
    } else if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      // System theme
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.add('light')
      }
    }

    // Save to localStorage
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        if (e.matches) {
          root.classList.add('dark')
        } else {
          root.classList.add('light')
        }
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme)
  }, [])

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setThemeState(newTheme)
  }, [theme])

  const isDark = theme === 'dark' || (
    theme === 'system' && 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
  }
}

export default useTheme
