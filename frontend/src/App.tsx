import { useState, useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useTheme } from '@/hooks'
import { ChatPage } from '@/pages/ChatPage'
import { AuthPage } from '@/pages/AuthPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { Layout } from '@/components/common/Layout'
import { AuthProvider } from '@/components/Auth/AuthProvider'

const queryClient = new QueryClient()

function App() {
  const { theme } = useTheme()
  
  // Initialize theme
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.add('light')
    }
  }, [theme])

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background text-foreground">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  padding: '1rem',
                },
                success: {
                  iconTheme: {
                    primary: 'hsl(var(--brand-success))',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'hsl(var(--brand-error))',
                    secondary: 'white',
                  },
                },
              }}
            />
            
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/chat" replace />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
