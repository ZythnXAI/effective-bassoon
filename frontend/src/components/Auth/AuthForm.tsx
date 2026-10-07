import React from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

export const AuthForm: React.FC = () => {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')

  return (
    <div className="w-full max-w-md mx-auto">
      {mode === 'register' ? (
        <RegisterForm />
      ) : (
        <LoginForm />
      )}
    </div>
  )
}

export default AuthForm
