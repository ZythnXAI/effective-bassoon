import React from 'react'
import { Palette, Sun, Moon, Monitor, Paintbrush } from 'lucide-react'
import { Theme } from '@/types'

interface AppearanceSettingsProps {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

export const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({
  theme,
  setTheme,
  isDark,
}) => {
  const themeOptions = [
    { value: 'light' as Theme, label: 'Claro', icon: Sun },
    { value: 'dark' as Theme, label: 'Escuro', icon: Moon },
    { value: 'system' as Theme, label: 'Sistema', icon: Monitor },
  ]

  const fontSizeOptions = [
    { value: 'small', label: 'Pequeno' },
    { value: 'medium', label: 'Médio' },
    { value: 'large', label: 'Grande' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Aparência</h2>
        <p className="text-muted-foreground">
          Personalize a aparência do NexusMind AI
        </p>
      </div>

      {/* Theme selection */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <Palette className="w-4 h-4 mr-2" />
            Tema
          </label>
          <p className="text-sm text-muted-foreground">
            Escolha entre tema claro, escuro ou siga as preferências do sistema
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={`p-4 rounded-lg border-2 transition-colors ${
                theme === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-input hover:border-muted'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                <option.icon className="w-6 h-6" />
                <span className="text-sm">{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <Paintbrush className="w-4 h-4 mr-2" />
            Tamanho da Fonte
          </label>
          <p className="text-sm text-muted-foreground">
            Ajuste o tamanho da fonte de acordo com sua preferência
          </p>
        </div>

        <div className="flex space-x-2">
          {fontSizeOptions.map((option) => (
            <button
              key={option.value}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                // In a real app, this would check the current font size setting
                false
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-medium mb-2">Visualização</h3>
        <div className="p-4 rounded-lg bg-muted">
          <div className="space-y-2">
            <div className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'}`}>
              Tema Atual: {themeOptions.find(t => t.value === theme)?.label}
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Esta é uma visualização de como o tema selecionado será aplicado.
            </p>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <span className="text-sm">Chat Message</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppearanceSettings
