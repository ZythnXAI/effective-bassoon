// Format utilities
export const formatDate = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateTime = (dateString: string | Date): string => {
  return `${formatDate(dateString)} às ${formatTime(dateString)}`
}

export const formatRelativeTime = (dateString: string | Date): string => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  }

  for (const [unit, seconds] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / seconds)
    if (interval >= 1) {
      return interval === 1
        ? `há ${interval} ${unit}`
        : `há ${interval} ${unit}s`
    }
  }

  return 'agora'
}

// String utilities
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const toTitleCase = (text: string): string => {
  return text.split(' ').map(capitalize).join(' ')
}

// ID generation
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15)
}

// Storage utilities
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch {
    return defaultValue
  }
}

export const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

// URL utilities
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Markdown utilities
export const escapeMarkdown = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\*/g, '\\*')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\\(/g, '\\\\(')
    .replace(/\\)/g, '\\\)')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/\-/g, '\\-')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!')
}

// Model utilities
export const getModelDisplayName = (modelId: string): string => {
  const modelNames: Record<string, string> = {
    'llama-3-8b': 'Llama 3 8B',
    'mixtral-8x7b': 'Mixtral 8x7B',
    'gemma-7b': 'Gemma 7B',
    'e2b-code': 'E2B Code',
    'e2b-chat': 'E2B Chat',
    'manus-v2': 'Manus v2',
    'fal-llm': 'Fal LLM',
    'nim-llama-3': 'NVIDIA Llama 3',
    'daytona-code': 'Daytona Code',
    'exa-search': 'Exa Search',
    'browserbase-browser': 'BrowserBase Browser',
  }

  return modelNames[modelId] || modelId
}

// Provider utilities
export const getProviderIcon = (provider: string): string => {
  const icons: Record<string, string> = {
    e2b: '⚡',
    groq: '⚡',
    manus: '🧠',
    fal: '🎯',
    nvidia_nim: '🟢',
    daytona: '💻',
    exa: '🔍',
    browserbase: '🌐',
  }

  return icons[provider.toLowerCase()] || '❓'
}

// Error handling
export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const handleApiError = async (response: Response): Promise<never> => {
  const errorData = await response.json().catch(() => ({}))
  const message = errorData.detail || errorData.message || 'An error occurred'
  const statusCode = response.status

  throw new AppError(message, statusCode, errorData)
}

// Debounce utility
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>

  return (...args: Parameters<F>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), wait)
  }
}

// Throttle utility
export const throttle = <F extends (...args: any[]) => any>(
  func: F,
  limit: number
): ((...args: Parameters<F>) => void) => {
  let inThrottle = false

  return (...args: Parameters<F>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
