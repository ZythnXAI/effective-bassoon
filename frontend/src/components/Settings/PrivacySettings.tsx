import React, { useState } from 'react'
import { Shield, Eye, EyeOff, Trash2, Download, Check, X } from 'lucide-react'

export const PrivacySettings: React.FC = () => {
  const [chatHistoryEnabled, setChatHistoryEnabled] = useState(true)
  const [showAvatars, setShowAvatars] = useState(true)
  const [autoDeleteEnabled, setAutoDeleteEnabled] = useState(false)
  const [autoDeleteDays, setAutoDeleteDays] = useState(30)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Privacidade</h2>
        <p className="text-muted-foreground">
          Controle suas configurações de privacidade e dados
        </p>
      </div>

      <div className="space-y-4">
        {/* Chat History */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5" />
            <div>
              <h3 className="font-medium">Histórico de Conversas</h3>
              <p className="text-sm text-muted-foreground">
                Salvar histórico de conversas para referências futuras
              </p>
            </div>
          </div>
          <button
            onClick={() => setChatHistoryEnabled(!chatHistoryEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              chatHistoryEnabled
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {chatHistoryEnabled ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Show Avatars */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5" />
            <div>
              <h3 className="font-medium">Mostrar Avatares</h3>
              <p className="text-sm text-muted-foreground">
                Exibir avatares nas mensagens do chat
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowAvatars(!showAvatars)}
            className={`p-2 rounded-lg transition-colors ${
              showAvatars
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {showAvatars ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>

        {/* Auto-delete */}
        <div className="p-4 rounded-lg bg-muted">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Trash2 className="w-5 h-5" />
              <div>
                <h3 className="font-medium">Excluir Dados Automaticamente</h3>
                <p className="text-sm text-muted-foreground">
                  Excluir conversas antigas automaticamente
                </p>
              </div>
            </div>
            <button
              onClick={() => setAutoDeleteEnabled(!autoDeleteEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                autoDeleteEnabled
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted/50'
              }`}
            >
              {autoDeleteEnabled ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {autoDeleteEnabled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Excluir conversas após
              </label>
              <select
                value={autoDeleteDays}
                onChange={(e) => setAutoDeleteDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-ring"
              >
                <option value={7}>7 dias</option>
                <option value={30}>30 dias</option>
                <option value={90}>90 dias</option>
                <option value={180}>6 meses</option>
                <option value={365}>1 ano</option>
              </select>
            </div>
          )}
        </div>

        {/* Data export */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-2">Exportar Dados</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Baixe uma cópia dos seus dados
          </p>

          <div className="space-y-2">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border border-input hover:bg-muted transition-colors">
              <Download className="w-5 h-5" />
              <span>Exportar Histórico de Conversas</span>
            </button>
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border border-input hover:bg-muted transition-colors">
              <Download className="w-5 h-5" />
              <span>Exportar Configurações</span>
            </button>
          </div>
        </div>

        {/* Delete account */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-2 text-red-500">
            Excluir Conta
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente.
          </p>

          <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border border-red-500 text-red-500 hover:bg-red-500/10 transition-colors">
            <Trash2 className="w-5 h-5" />
            <span>Excluir Minha Conta</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PrivacySettings
