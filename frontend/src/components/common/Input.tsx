import React, { forwardRef, useState } from 'react'
import { cn } from '@/utils/cn'
import { Eye, EyeOff } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    error, 
    hint,
    leftIcon,
    rightIcon,
    ...props 
  }, ref) => {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={inputType}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-background text-foreground',
            'focus:outline-none focus:border-ring transition-colors',
            'placeholder:text-muted-foreground',
            error ? 'border-red-500' : 'border-input',
            leftIcon ? 'pl-11' : '',
            rightIcon || (isPassword && type === 'password') ? 'pr-11' : '',
            className
          )}
          {...props}
        />
        {isPassword && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
        {rightIcon && !isPassword && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}
)

Input.displayName = 'Input'

export default Input
