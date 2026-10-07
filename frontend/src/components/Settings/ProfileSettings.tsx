import React, { useState } from 'react'
import { User, Mail, Edit2, Check, X } from 'lucide-react'
import { UserResponse } from '@/types'

interface ProfileSettingsProps {
  user: UserResponse | null
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [fullName, setFullName] = useState(user?.full_name || '')

  const handleSave = () => {
    // In a real app, this would call an API to update the profile
    console.log('Profile updated:', { username, email, fullName })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setUsername(user?.username || '')
    setEmail(user?.email || '')
    setFullName(user?.full_name || '')
    setIsEditing(false)
  }

  if (!user) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Por favor, faça login para ver suas configurações de perfil
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Perfil</h2>
        <p className="text-muted-foreground">
          Gerencie suas informações de perfil
        </p>
      </div>

      <div className="space-y-4">
        {/* Avatar */}
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="font-medium">{user.username}</h3>
            <p className="text-sm text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <User className="w-4 h-4 mr-2" />
            Usuário
          </label>
          {isEditing ? (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-ring"
            />
          ) : (
            <div className="px-3 py-2 rounded-lg bg-muted">{user.username}</div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-ring"
            />
          ) : (
            <div className="px-3 py-2 rounded-lg bg-muted">{user.email}</div>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Nome Completo
          </label>
          {isEditing ? (
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:border-ring"
            />
          ) : (
            <div className="px-3 py-2 rounded-lg bg-muted">
              {user.full_name || 'Não definido'}
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="pt-4 border-t border-border">
          <h3 className="text-sm font-medium mb-2">Informações da Conta</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Conta criada em:</span>
              <span>{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
            {user.last_login && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último login:</span>
                <span>{new Date(user.last_login).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit buttons */}
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="btn btn-primary flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Salvar
              </button>
              <button
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-secondary"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Editar Perfil
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings
