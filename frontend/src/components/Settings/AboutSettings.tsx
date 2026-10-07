import React from 'react'
import { Info, Heart, Code, Users, Calendar, Sparkles } from 'lucide-react'

export const AboutSettings: React.FC = () => {
  const features = [
    { icon: Sparkles, title: 'Múltiplos Modelos de IA', description: 'Acesse mais de 8 APIs de IA diferentes' },
    { icon: Code, title: 'Suporte a Código', description: 'Execute e analise código com Daytona' },
    { icon: Users, title: 'Gerenciamento de Usuários', description: 'Controle de acesso e autenticação' },
    { icon: Calendar, title: 'Histórico de Conversas', description: 'Mantenha o histórico das suas interações' },
  ]

  const integratedApis = [
    { name: 'E2B', description: 'Modelos de código e chat' },
    { name: 'Exa AI', description: 'Busca semântica' },
    { name: 'Manus AI', description: 'Modelos de linguagem' },
    { name: 'GROQ', description: 'Modelos rápidos' },
    { name: 'Fal AI', description: 'Modelos de linguagem' },
    { name: 'Daytona', description: 'Execução de código' },
    { name: 'BrowserBase', description: 'Navegação web' },
    { name: 'NVIDIA NIM', description: 'Modelos NVIDIA' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Sobre o NexusMind AI</h2>
        <p className="text-muted-foreground">
          Conheça mais sobre a plataforma
        </p>
      </div>

      {/* App Info */}
      <div className="p-4 rounded-lg bg-muted">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">NexusMind AI</h3>
            <p className="text-muted-foreground">v1.0.0</p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          NexusMind AI é uma plataforma completa de chat de IA que integra múltiplos 
          modelos de linguagem e ferramentas de IA através de APIs de terceiros.
        </p>
      </div>

      {/* Features */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium mb-4">Recursos Principais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="p-4 rounded-lg bg-muted">
              <feature.icon className="w-6 h-6 mb-2 text-primary" />
              <h4 className="font-medium mb-1">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Integrated APIs */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium mb-4">APIs Integradas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {integratedApis.map((api, index) => (
            <div key={index} className="p-3 rounded-lg bg-muted text-center">
              <div className="font-medium text-sm">{api.name}</div>
              <div className="text-xs text-muted-foreground">{api.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Technology Stack */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium mb-4">Tecnologias Utilizadas</h3>
        <div className="space-y-2">
          <div className="flex justify-between px-4 py-2 rounded-lg bg-muted">
            <span className="font-medium">Backend</span>
            <span className="text-sm text-muted-foreground">FastAPI, Python</span>
          </div>
          <div className="flex justify-between px-4 py-2 rounded-lg bg-muted">
            <span className="font-medium">Frontend</span>
            <span className="text-sm text-muted-foreground">React, TypeScript, Tailwind</span>
          </div>
          <div className="flex justify-between px-4 py-2 rounded-lg bg-muted">
            <span className="font-medium">Banco de Dados</span>
            <span className="text-sm text-muted-foreground">SQLite</span>
          </div>
          <div className="flex justify-between px-4 py-2 rounded-lg bg-muted">
            <span className="font-medium">Infraestrutura</span>
            <span className="text-sm text-muted-foreground">Docker</span>
          </div>
        </div>
      </div>

      {/* Support */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium mb-4">Suporte e Contato</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Para reportar bugs, sugerir recursos ou obter suporte, entre em contato:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Email: suporte@nexusmind.ai</li>
            <li>GitHub: github.com/nexusmind-ai</li>
            <li>Documentação: docs.nexusmind.ai</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-border text-center text-sm text-muted-foreground">
        <p className="flex items-center justify-center space-x-1">
          <Heart className="w-4 h-4 text-red-500" />
          <span>Feito com amor pela equipe NexusMind</span>
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} NexusMind AI. Todos os direitos reservados.
        </p>
      </div>
    </div>
  )
}

export default AboutSettings
