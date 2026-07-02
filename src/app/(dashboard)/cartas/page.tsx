'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Heart, X, Mail, Trash2, Send, Inbox } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserEmail } from '@/lib/auth'
import { sendEmail, templateCarta } from '@/lib/email'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateLong } from '@/lib/utils'
import type { Letter, Profile } from '@/types'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  titulo: '',
  conteudo: '',
  para: '',
}

export default function CartasPage() {
  const supabase = createClient()
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'para-mim' | 'para-voce'>('para-mim')
  const [showModal, setShowModal] = useState(false)
  const [viewLetter, setViewLetter] = useState<Letter | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])

  useEffect(() => {
    const email = getCurrentUserEmail()
    setCurrentUserEmail(email)
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: lettersData }, { data: profilesData }] = await Promise.all([
      supabase.from('letters').select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*'),
    ])
    setLetters(lettersData ?? [])
    setProfiles(profilesData ?? [])
    setLoading(false)
  }

  const paraMin = letters.filter(l => l.de === currentUserEmail)
  const paraVoce = letters.filter(l => l.para === currentUserEmail)
  const displayed = tab === 'para-mim' ? paraMin : paraVoce

  async function saveLetter() {
    if (!form.titulo.trim() || !form.conteudo.trim()) {
      toast.error('Título e conteúdo são obrigatórios')
      return
    }
    setSaving(true)
    const payload = {
      titulo: form.titulo,
      conteudo: form.conteudo,
      de: currentUserEmail,
      para: form.para || null,
    }
    const { data, error } = await supabase.from('letters').insert(payload).select().single()
    if (error) { toast.error('Erro ao enviar carta'); setSaving(false); return }
    setLetters(prev => [data, ...prev])
    
    // Notificar o outro membro do casal
    if (form.para && form.para !== currentUserEmail) {
      const nomeRemetente = currentUserEmail === 'lcunhaleandro@gmail.com' ? 'Leandro' : 'Débora'
      sendEmail({
        to: form.para,
        subject: '💌 Você recebeu uma carta!',
        html: templateCarta(nomeRemetente, form.titulo),
      })
    }
    
    toast.success('Carta enviada! 💌')
    setSaving(false)
    setShowModal(false)
    setForm(EMPTY_FORM)
  }

  async function toggleFavorite(letter: Letter) {
    await supabase.from('letters').update({ favorito: !letter.favorito }).eq('id', letter.id)
    setLetters(prev => prev.map(l => l.id === letter.id ? { ...l, favorito: !l.favorito } : l))
    if (viewLetter?.id === letter.id) setViewLetter(prev => prev ? { ...prev, favorito: !prev.favorito } : null)
  }

  async function deleteLetter(letter: Letter) {
    if (!confirm('Excluir esta carta permanentemente?')) return
    await supabase.from('letters').delete().eq('id', letter.id)
    setLetters(prev => prev.filter(l => l.id !== letter.id))
    if (viewLetter?.id === letter.id) setViewLetter(null)
    toast.success('Carta excluída')
  }

  async function markRead(letter: Letter) {
    if (letter.lida) return
    await supabase.from('letters').update({ lida: true }).eq('id', letter.id)
    setLetters(prev => prev.map(l => l.id === letter.id ? { ...l, lida: true } : l))
  }

  function getProfileName(email: string | null) {
    if (!email) return 'Desconhecido'
    const p = profiles.find(p => p.email === email)
    return p?.apelido ?? p?.nome ?? email.split('@')[0] ?? 'Usuário'
  }

  function openLetter(letter: Letter) {
    setViewLetter(letter)
    if (!letter.lida && letter.de === currentUserEmail) markRead(letter)
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Cartas" subtitle="Mensagens do coração" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Header action */}
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex glass rounded-xl p-1 gap-1">
            <button
              onClick={() => setTab('para-mim')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'para-mim'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Inbox className="w-4 h-4" />
              Para mim
              {paraMin.filter(l => !l.lida).length > 0 && (
                <span className="bg-rose-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {paraMin.filter(l => !l.lida).length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTab('para-voce')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'para-voce'
                  ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Send className="w-4 h-4" />
              Para você
            </button>
          </div>

          <Button variant="gradient" size="sm" onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Escrever Carta
          </Button>
        </div>

        {/* Letters */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Mail className="w-16 h-16 text-rose-500/30 mb-4" />
            <p className="text-lg font-medium">
              {tab === 'para-mim' ? 'Nenhuma carta para você' : 'Você não enviou cartas ainda'}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {tab === 'para-mim' ? 'Quando receberem uma carta, ela aparecerá aqui' : 'Clique em "Escrever Carta" para expressar seus sentimentos'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {displayed.map((letter, i) => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className={`group relative cursor-pointer rounded-2xl p-[1px] ${
                  letter.favorito
                    ? 'bg-gradient-to-br from-rose-500 to-purple-500'
                    : 'bg-gradient-to-br from-rose-500/20 to-purple-500/20'
                }`}
                onClick={() => openLetter(letter)}
              >
                <div className="glass rounded-2xl p-4 h-full relative">
                  {/* Unread dot */}
                  {!letter.lida && letter.de === currentUserEmail && (
                    <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse" />
                  )}

                  {/* Letter icon */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center mb-3">
                    <Mail className="w-5 h-5 text-rose-400" />
                  </div>

                  <h3 className="font-semibold line-clamp-1 mb-1">{letter.titulo}</h3>

                  <p className="text-xs text-muted-foreground mb-2">
                    {tab === 'para-mim'
                      ? `De: ${getProfileName(letter.de)}`
                      : `Para: ${getProfileName(letter.para)}`}
                  </p>

                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {letter.conteudo.slice(0, 120)}{letter.conteudo.length > 120 ? '...' : ''}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-muted-foreground">{formatDateLong(letter.created_at)}</p>
                    {letter.favorito && <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* View Letter Modal */}
      <AnimatePresence>
        {viewLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setViewLetter(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Letter paper effect */}
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-rose-500 to-purple-500">
                <div className="glass rounded-2xl p-8">
                  {/* Decorative top */}
                  <div className="text-center mb-6">
                    <div className="text-3xl mb-2">💌</div>
                    <div className="h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />
                  </div>

                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">{viewLetter.titulo}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        De {getProfileName(viewLetter.de)} para {getProfileName(viewLetter.para)}
                        <span className="mx-2">·</span>
                        {formatDateLong(viewLetter.created_at)}
                      </p>
                    </div>
                    <button onClick={() => setViewLetter(null)} className="text-muted-foreground hover:text-foreground ml-4">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-base leading-loose whitespace-pre-wrap text-foreground/90">
                      {viewLetter.conteudo}
                    </p>
                  </div>

                  {/* Decorative bottom */}
                  <div className="mt-8">
                    <div className="h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent mb-6" />
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground italic">Com carinho, {getProfileName(viewLetter.de)} ❤️</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleFavorite(viewLetter)}
                          className="p-2 rounded-xl glass hover:bg-white/10"
                        >
                          <Heart className={`w-5 h-5 ${viewLetter.favorito ? 'fill-rose-400 text-rose-400' : 'text-muted-foreground'}`} />
                        </button>
                        <button
                          onClick={() => deleteLetter(viewLetter)}
                          className="p-2 rounded-xl glass hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write Letter Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold gradient-text">Escrever Carta 💌</h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Para</label>
                    <select
                      value={form.para}
                      onChange={e => setForm(f => ({ ...f, para: e.target.value }))}
                      className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    >
                      <option value="">Selecione o destinatário</option>
                      {profiles.filter(p => p.email !== currentUserEmail).map(p => (
                        <option key={p.email} value={p.email}>{p.apelido ?? p.nome ?? p.email}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Título *</label>
                    <Input
                      value={form.titulo}
                      onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                      placeholder="Ex: Para o amor da minha vida"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Sua carta *</label>
                    <textarea
                      value={form.conteudo}
                      onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
                      placeholder="Escreva tudo o que sente no coração..."
                      className="w-full h-48 bg-white/5 border border-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/50 leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="gradient" className="flex-1" onClick={saveLetter} disabled={saving}>
                    <Send className="w-4 h-4" />
                    {saving ? 'Enviando...' : 'Enviar Carta'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}