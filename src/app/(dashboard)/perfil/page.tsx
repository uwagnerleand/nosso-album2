'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Camera, Save, Edit2, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserEmail } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/store/useAppStore'
import { formatDate } from '@/lib/utils'
import type { Profile } from '@/types'
import toast from 'react-hot-toast'

const profileFields = [
  { key: 'nome', label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
  { key: 'apelido', label: 'Apelido', type: 'text', placeholder: 'Como te chamam?' },
  { key: 'data_nascimento', label: 'Data de nascimento', type: 'date', placeholder: '' },
  { key: 'cor_favorita', label: 'Cor favorita', type: 'text', placeholder: 'Ex: Rosa' },
  { key: 'comida_favorita', label: 'Comida favorita', type: 'text', placeholder: 'Ex: Pizza' },
  { key: 'filme_favorito', label: 'Filme favorito', type: 'text', placeholder: 'Ex: Diário de uma paixão' },
  { key: 'musica_favorita', label: 'Música favorita', type: 'text', placeholder: 'Ex: Perfect - Ed Sheeran' },
]

export default function PerfilPage() {
  const supabase = createClient()
  const { user: storeUser, setUser } = useAppStore()

  const [profile, setProfile] = useState<Partial<Profile>>({})
  const [sonhos, setSonhos] = useState('')
  const [curiosidades, setCuriosidades] = useState('')
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (storeUser) {
      setProfile(storeUser)
      setSonhos(storeUser.sonhos ?? '')
      setCuriosidades(storeUser.curiosidades ?? '')
    }
  }, [storeUser])

  async function handleSave() {
    setLoading(true)
    const userEmail = getCurrentUserEmail()
    if (!userEmail) { toast.error('Usuário não autenticado'); setLoading(false); return }
    const { error } = await supabase.from('profiles').update({
      ...profile,
      sonhos,
      curiosidades,
    }).eq('email', userEmail)

    if (error) { toast.error(error.message); setLoading(false); return }

    const { data: updated } = await supabase.from('profiles').select('*').eq('email', userEmail).single()
    if (updated) setUser(updated as Profile)

    toast.success('Perfil salvo! ✨')
    setEditing(false)
    setLoading(false)
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const userEmail = getCurrentUserEmail()
    if (!userEmail) { toast.error('Não autenticado'); setUploading(false); return }

    const safeEmail = userEmail.replace(/[@.]/g, '_')
    const path = `${safeEmail}/avatar.${file.name.split('.').pop()}`

    const { data, error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { toast.error(`Erro no upload: ${error.message}`); setUploading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(data.path)

    const { error: updateErr } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('email', userEmail)
    if (updateErr) {
      await supabase.from('profiles').insert({ email: userEmail, avatar_url: publicUrl })
    }

    setProfile(p => ({ ...p, avatar_url: publicUrl }))
    if (storeUser) setUser({ ...storeUser, avatar_url: publicUrl })

    toast.success('Foto atualizada!')
    setUploading(false)
  }

  const initials = (profile.nome ?? storeUser?.email ?? '?').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col flex-1">
      <Header title="Perfil" subtitle="Suas informações pessoais" />

      <div className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full space-y-5">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center"
        >
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto ring-4 ring-rose-500/30">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <h2 className="text-xl font-bold mt-3">{profile.nome ?? 'Sem nome'}</h2>
          {profile.apelido && <p className="text-muted-foreground">"{profile.apelido}"</p>}
          <p className="text-sm text-muted-foreground mt-1">{storeUser?.email}</p>
          {profile.data_nascimento && (
            <p className="text-sm text-muted-foreground mt-0.5">
              🎂 {formatDate(profile.data_nascimento)}
            </p>
          )}
        </motion.div>

        {/* Info card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-4 h-4 text-rose-400" />
              Informações
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editing ? handleSave() : setEditing(true)}
              loading={loading}
            >
              {editing ? <><Save className="w-4 h-4" /> Salvar</> : <><Edit2 className="w-4 h-4" /> Editar</>}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profileFields.map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-1">
                <label className="text-xs text-muted-foreground">{label}</label>
                {editing ? (
                  <Input
                    type={type}
                    placeholder={placeholder}
                    value={(profile as Record<string, unknown>)[key] as string ?? ''}
                    onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}
                  />
                ) : (
                  <p className="text-sm py-2 px-3 rounded-xl bg-muted/30 min-h-[44px] flex items-center">
                    {(profile as Record<string, unknown>)[key] as string || <span className="text-muted-foreground italic">Não informado</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sonhos e Curiosidades */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 space-y-4"
        >
          <h3 className="font-semibold flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            Sonhos & Curiosidades
          </h3>

          {editing ? (
            <>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Seus sonhos</label>
                <textarea
                  value={sonhos}
                  onChange={e => setSonhos(e.target.value)}
                  placeholder="O que você sonha alcançar?"
                  className="w-full min-h-[80px] rounded-xl border border-input bg-background/50 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Curiosidades sobre você</label>
                <textarea
                  value={curiosidades}
                  onChange={e => setCuriosidades(e.target.value)}
                  placeholder="Conte algo que poucas pessoas sabem..."
                  className="w-full min-h-[80px] rounded-xl border border-input bg-background/50 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </div>
            </>
          ) : (
            <>
              {sonhos && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Sonhos ✨</p>
                  <p className="text-sm bg-muted/30 rounded-xl p-3">{sonhos}</p>
                </div>
              )}
              {curiosidades && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Curiosidades 🦋</p>
                  <p className="text-sm bg-muted/30 rounded-xl p-3">{curiosidades}</p>
                </div>
              )}
              {!sonhos && !curiosidades && (
                <p className="text-sm text-muted-foreground">
                  Clique em Editar para adicionar seus sonhos e curiosidades
                </p>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}
