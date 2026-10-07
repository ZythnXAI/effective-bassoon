import React, { useState } from 'react'
import { Globe, Check } from 'lucide-react'

interface LanguageOption {
  code: string
  name: string
  nativeName: string
}

const languageOptions: LanguageOption[] = [
  { code: 'pt-BR', name: 'Português (Brasil)', nativeName: 'Português' },
  { code: 'en-US', name: 'English (US)', nativeName: 'English' },
  { code: 'es-ES', name: 'Español (España)', nativeName: 'Español' },
  { code: 'fr-FR', name: 'Français (France)', nativeName: 'Français' },
  { code: 'de-DE', name: 'Deutsch (Deutschland)', nativeName: 'Deutsch' },
  { code: 'it-IT', name: 'Italiano (Italia)', nativeName: 'Italiano' },
  { code: 'ja-JP', name: '日本語 (日本)', nativeName: '日本語' },
  { code: 'zh-CN', name: '中文 (中国)', nativeName: '中文' },
]

export const LanguageSettings: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('pt-BR')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Idioma</h2>
        <p className="text-muted-foreground">
          Selecione o idioma da interface
        </p>
      </div>

      <div className="space-y-4">
        {/* Current language */}
        <div className="p-4 rounded-lg bg-muted">
          <h3 className="text-sm font-medium mb-1">Idioma Atual</h3>
          <p className="text-lg">
            {languageOptions.find(lang => lang.code === selectedLanguage)?.nativeName || 'Português'}
          </p>
        </div>

        {/* Language selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Selecione um idioma</h3>
          <p className="text-sm text-muted-foreground">
            O idioma será aplicado a toda a interface do aplicativo
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {languageOptions.map((language) => (
              <button
                key={language.code}
                onClick={() => setSelectedLanguage(language.code)}
                className={`p-3 rounded-lg border-2 text-left transition-colors ${
                  selectedLanguage === language.code
                    ? 'border-primary bg-primary/10'
                    : 'border-input hover:border-muted'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-sm text-muted-foreground">{language.name}</div>
                  </div>
                  {selectedLanguage === language.code && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Translation note */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-2">Nota sobre Tradução</h3>
          <p className="text-sm text-muted-foreground">
            A interface está disponível em vários idiomas, mas as respostas da IA 
            serão geradas no idioma que você usar nas suas mensagens.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LanguageSettings
