'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Lock, Unlock, Plus, X, Calendar, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserEmail } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateLong } from '@/lib/utils'
import { differenceInDays, isPast, parseISO } from 'date-fns'
import type { TimeCapsule } from '@/types'
import toast from 'react-hot-toast'

export default function CapsulasPage() {
  const supabase = createClient()
  const [capsules, setCapsules] = useState<TimeCapsule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState<TimeCapsule | null>(null)
  const [form, setForm] = useState({ titulo: '', mensagem: '', data_abertura: '' })

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('time_capsules').select('*').order('data_abertura')
    setCapsules(data ?? [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo || !form.data_abertura) { toast.error('Preencha título e data'); return }
    const userEmail = getCurrentUserEmail()
    const { error } = await supabase.from('time_capsules').insert({
      titulo: form.titulo, mensagem: form.mensagem, data_abertura: form.data_abertura, criado_por: userEmail
    })
    if (error) { toast.error(error.message); return }
    toast.success('Cápsula criada! Será aberta em ' + formatDateLong(form.data_abertura) + ' 🎁')
    setForm({ titulo: '', mensagem: '', data_abertura: '' })
    setShowForm(false)
    load()
  }

  async function openCapsule(capsule: TimeCapsule) {
    if (!isPast(parseISO(capsule.data_abertura))) {
      toast.error('Esta cápsula ainda não pode ser aberta!')
      return
    }
    if (!capsule.aberta) {
      await supabase.from('time_capsules').update({ aberta: true, data_aberta: new Date().toISOString() }).eq('id', capsule.id)
      toast.success('Cápsula aberta! 🎉')
    }
    setSelected(capsule)
  }

  async function deleteCapsule(id: string) {
    if (!confirm('Excluir esta cápsula?')) return
    await supabase.from('time_capsules').delete().eq('id', id)
    setCapsules(prev => prev.filter(c => c.id !== id))
    setSelected(null)
    toast.success('Cápsula excluída')
  }

  const canOpen = (c: TimeCapsule) => isPast(parseISO(c.data_abertura))

  return (
    <div className="flex flex-col flex-1">
      <Header title="Cápsula do Tempo" subtitle="Mensagens para o futuro" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center"
        >
          <Package className="w-10 h-10 mx-auto text-amber-400 mb-2" />
          <h2 className="text-lg font-semibold">Mensagens para o Futuro</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Guarde segredos, sonhos e surpresas para serem revelados em datas especiais
          </p>
        </motion.div>

        <div className="flex justify-end">
          <Button variant="gradient" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" /> Nova Cápsula
          </Button>
        </div>

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
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" />
                    Nova Cápsula
                  </h3>
                  <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                  <Input placeholder="Título da cápsula" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} required />
                  <div className="space-y-1">
                    <label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Data para abrir
                    </label>
                    <Input type="date" value={form.data_abertura} onChange={e => setForm(p => ({ ...p, data_abertura: e.target.value }))} required />
                  </div>
                  <textarea
                    placeholder="Mensagem secreta para o futuro... Conte seus sonhos, planos, sentimentos ❤️"
                    value={form.mensagem}
                    onChange={e => setForm(p => ({ ...p, mensagem: e.target.value }))}
                    className="w-full min-h-[140px] rounded-xl border border-input bg-background/50 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  />
                  <div className="flex gap-2 pt-1">
                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>Cancelar</Button>
                    <Button type="submit" variant="gradient" className="flex-1">
                      <Lock className="w-4 h-4" /> Selar Cápsula
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Open capsule modal */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.3 }}
                className="glass-card p-6 w-full max-w-md relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5" />
                <div className="relative z-10">
                  <div className="text-center mb-4">
                    <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <h3 className="text-xl font-bold gradient-text">{selected.titulo}</h3>
                    <p className="text-sm text-muted-foreground">Criada em {formatDateLong(selected.created_at)}</p>
                  </div>
                  <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selected.mensagem || '(Sem mensagem)'}
                    </p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="ghost" className="flex-1" onClick={() => setSelected(null)}>Fechar</Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCapsule(selected.id)}>Excluir</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Capsules grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />)}
          </div>
        ) : capsules.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">📦</div>
            <p className="font-medium">Nenhuma cápsula criada</p>
            <p className="text-sm text-muted-foreground mt-1">Guarde uma mensagem para o futuro</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {capsules.map((c, i) => {
              const open = canOpen(c)
              const dias = differenceInDays(parseISO(c.data_abertura), new Date())

              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => openCapsule(c)}
                  className={`glass-card p-5 cursor-pointer hover:scale-[1.02] transition-transform ${
                    open ? 'border-amber-500/30' : 'border-border/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      open ? 'bg-amber-500/20' : 'bg-muted'
                    }`}>
                      {open ? <Unlock className="w-5 h-5 text-amber-400" /> : <Lock className="w-5 h-5 text-muted-foreground" />}
                    </div>
                    {open && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">Disponível!</span>}
                  </div>
                  <h4 className="font-semibold">{c.titulo}</h4>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {open ? 'Aberta em ' + formatDateLong(c.data_abertura) : `Abre em ${formatDateLong(c.data_abertura)}`}
                  </p>
                  {!open && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Faltam {dias} dia{dias !== 1 ? 's' : ''}
                    </p>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
