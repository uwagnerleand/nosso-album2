'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, X, Heart, Trash2, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserEmail } from '@/lib/auth'
import { sendEmail, templateRecado } from '@/lib/email'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import type { WallMessage } from '@/types'
import toast from 'react-hot-toast'

const BG_COLORS = ['#fce7f3', '#fef3c7', '#dbeafe', '#d1fae5', '#ede9fe', '#fee2e2']
const EMOJIS = ['❤️', '😍', '🥰', '💋', '🌹', '💕', '✨', '🦋', '🌸', '💫', '🎀', '💝']

export default function MuralPage() {
  const supabase = createClient()
  const [messages, setMessages] = useState<WallMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ mensagem: '', emoji: '❤️', cor_fundo: '#fce7f3' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('wall_messages').select('*').order('created_at', { ascending: false })
    setMessages(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.mensagem.trim()) { toast.error('Escreva uma mensagem'); return }
    const userEmail = getCurrentUserEmail()
    
    const { data: inserted, error } = await supabase.from('wall_messages').insert({
      mensagem: form.mensagem, emoji: form.emoji, cor_fundo: form.cor_fundo, de: userEmail
    }).select()
    
    if (error) { toast.error(error.message); return }
    if (!inserted || inserted.length === 0) { toast.error('Recado não foi salvo. Tente novamente.'); return }
    
    // Notificar o casal por email
    const nomeRemetente = userEmail === 'lcunhaleandro@gmail.com' ? 'Leandro' : 'Débora'
    sendEmail({
      to: userEmail === 'lcunhaleandro@gmail.com' ? 'debgarcia491@gmail.com' : 'lcunhaleandro@gmail.com',
      subject: '💌 Novo recado no mural!',
      html: templateRecado(nomeRemetente, form.mensagem),
    })
    
    toast.success('Recado enviado! 💕')
    setForm({ mensagem: '', emoji: '❤️', cor_fundo: '#fce7f3' })
    setShowForm(false)
    await load()
  }

  async function toggleFavorite(msg: WallMessage) {
    await supabase.from('wall_messages').update({ favorito: !msg.favorito }).eq('id', msg.id)
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, favorito: !m.favorito } : m))
  }

  async function deleteMessage(id: string) {
    if (!confirm('Excluir este recado?')) return
    await supabase.from('wall_messages').delete().eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
    toast.success('Recado excluído')
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Mural de Recados" subtitle="Pequenas mensagens com muito amor" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-5 bg-gradient-to-r from-pink-500/10 to-rose-500/10 border border-pink-500/20 flex items-center justify-between"
        >
          <div>
            <h2 className="font-semibold">Mural de Recados</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{messages.length} recados trocados</p>
          </div>
          <Button variant="gradient" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Novo Recado
          </Button>
        </motion.div>

        {/* Form modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="glass-card p-6 w-full max-w-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Novo Recado ❤️</h3>
                  <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    placeholder="Escreva seu recado especial..."
                    value={form.mensagem}
                    onChange={e => setForm(p => ({ ...p, mensagem: e.target.value }))}
                    className="w-full min-h-[100px] rounded-xl border border-input bg-background/50 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    required
                  />
                  <div>
                    <p className="text-sm font-medium mb-2">Emoji</p>
                    <div className="flex flex-wrap gap-2">
                      {EMOJIS.map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, emoji }))}
                          className={`w-9 h-9 rounded-xl text-xl transition-all ${form.emoji === emoji ? 'bg-rose-500/20 border border-rose-500/50 scale-110' : 'hover:bg-white/5'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Cor do Post-it</p>
                    <div className="flex gap-2">
                      {BG_COLORS.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setForm(p => ({ ...p, cor_fundo: color }))}
                          className={`w-8 h-8 rounded-lg transition-transform ${form.cor_fundo === color ? 'scale-125 ring-2 ring-rose-500 ring-offset-1' : 'hover:scale-110'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button type="submit" variant="gradient" className="flex-1">
                      <Send className="w-4 h-4" /> Enviar
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        {loading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl mb-3 break-inside-avoid" />)}
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">💌</div>
            <p className="font-medium">Nenhum recado ainda</p>
            <p className="text-sm text-muted-foreground mt-1">Envie o primeiro recado!</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {messages.map((msg, i) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.06, type: 'spring', bounce: 0.3 }}
                className="break-inside-avoid mb-4 rounded-2xl p-4 relative group shadow-sm"
                style={{ backgroundColor: msg.cor_fundo || '#fce7f3' }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-2xl">{msg.emoji}</span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleFavorite(msg)} className="p-1 rounded-lg hover:bg-black/5">
                      <Heart className={`w-4 h-4 ${msg.favorito ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}`} />
                    </button>
                    <button onClick={() => deleteMessage(msg.id)} className="p-1 rounded-lg hover:bg-black/5">
                      <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{msg.mensagem}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(msg.created_at)}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
