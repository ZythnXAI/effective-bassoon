import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark, atomLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ChatMessage } from '@/types'
import { useTheme } from '@/hooks'
import { User, Bot } from 'lucide-react'

interface ChatMessageBubbleProps {
  message: ChatMessage
  isLoading?: boolean
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isLoading,
}) => {
  const { isDark } = useTheme()

  // Custom components for ReactMarkdown
  const components = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''

      return !inline ? (
        <SyntaxHighlighter
          style={isDark ? atomDark : atomLight}
          language={language}
          PreTag="div"
          className="rounded-lg my-2"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    },
    table({ children }: any) {
      return (
        <div className="overflow-x-auto my-2">
          <table className="border-collapse border border-border rounded-lg">
            {children}
          </table>
        </div>
      )
    },
    th({ children }: any) {
      return (
        <th className="border border-border px-4 py-2 bg-muted text-left">
          {children}
        </th>
      )
    },
    td({ children }: any) {
      return (
        <td className="border border-border px-4 py-2">
          {children}
        </td>
      )
    },
    blockquote({ children }: any) {
      return (
        <blockquote className="border-l-4 border-primary pl-4 my-2">
          {children}
        </blockquote>
      )
    },
    a({ node, href, children, ...props }: any) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
          {...props}
        >
          {children}
        </a>
      )
    },
    img({ node, src, alt, ...props }: any) {
      return (
        <div className="my-2">
          <img
            src={src}
            alt={alt || ''}
            className="rounded-lg max-w-full h-auto"
            {...props}
          />
        </div>
      )
    },
  }

  return (
    <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        message.role === 'user' ? 'bg-primary' : 'bg-muted'
      }`}>
        {message.role === 'user' ? (
          <User className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-foreground" />
        )}
      </div>

      <div
        className={`chat-bubble ${
          message.role === 'user' 
            ? 'chat-bubble-user' 
            : 'chat-bubble-assistant'
        }`}
      >
        {isLoading && message.role === 'assistant' ? (
          <div className="loading-dots">
            <span />
            <span />
            <span />
          </div>
        ) : (
          <ReactMarkdown components={components}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  )
}

export default ChatMessageBubble
