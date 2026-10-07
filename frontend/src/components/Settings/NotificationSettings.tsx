import React, { useState } from 'react'
import { Bell, BellOff, Volume2, VolumeX, Mail, Check, X } from 'lucide-react'

export const NotificationSettings: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Notificações</h2>
        <p className="text-muted-foreground">
          Configure como você deseja ser notificado
        </p>
      </div>

      <div className="space-y-4">
        {/* Push notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5" />
            <div>
              <h3 className="font-medium">Notificações Push</h3>
              <p className="text-sm text-muted-foreground">
                Receba notificações no navegador
              </p>
            </div>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              notificationsEnabled
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {notificationsEnabled ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5" />
            <div>
              <h3 className="font-medium">Som das Notificações</h3>
              <p className="text-sm text-muted-foreground">
                Reproduza sons para notificações
              </p>
            </div>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              soundEnabled
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Email notifications */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5" />
            <div>
              <h3 className="font-medium">Notificações por Email</h3>
              <p className="text-sm text-muted-foreground">
                Receba atualizações por email
              </p>
            </div>
          </div>
          <button
            onClick={() => setEmailNotifications(!emailNotifications)}
            className={`p-2 rounded-lg transition-colors ${
              emailNotifications
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted/50'
            }`}
          >
            {emailNotifications ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Notification types */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-2">Tipos de Notificação</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Escolha quais notificações você deseja receber
          </p>
          
          <div className="space-y-2">
            {[
              { id: 'new_messages', label: 'Novas mensagens', enabled: true },
              { id: 'mentions', label: 'Menções', enabled: true },
              { id: 'updates', label: 'Atualizações do sistema', enabled: false },
              { id: 'promotions', label: 'Promoções', enabled: false },
            ].map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm">{notification.label}</span>
                <button
                  className={`p-1 rounded-lg transition-colors ${
                    notification.enabled
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {notification.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationSettings
