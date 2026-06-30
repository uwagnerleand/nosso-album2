'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Heart, MapPin, Calendar, Edit2, Trash2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserEmail } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateLong, CATEGORIES } from '@/lib/utils'
import type { Memory } from '@/types'
import toast from 'react-hot-toast'

export default function LinhaDoTempoPage() {
  const supabase = createClient()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Memory | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    titulo: '', descricao: '', data: '', local: '', cidade: '',
    categoria: 'geral', emoji: '❤️', favorito: false
  })

  useEffect(() => { loadMemories() }, [])

  async function loadMemories() {
    setLoading(true)
    const { data } = await supabase.from('memories').select('*').order('data', { ascending: false })
    setMemories(data ?? [])
    setLoading(false)
  }

  function openEdit(m: Memory) {
    setEditing(m)
    setForm({ titulo: m.titulo, descricao: m.descricao ?? '', data: m.data, local: m.local ?? '', cidade: m.cidade ?? '', categoria: m.categoria, emoji: m.emoji, favorito: m.favorito })
    setShowForm(true)
  }

  function resetForm() {
    setForm({ titulo: '', descricao: '', data: '', local: '', cidade: '', categoria: 'geral', emoji: '❤️', favorito: false })
    setEditing(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.titulo || !form.data) { toast.error('Título e data são obrigatórios'); return }
    const userEmail = getCurrentUserEmail()

    if (editing) {
      const { error } = await supabase.from('memories').update(form).eq('id', editing.id)
      if (error) { toast.error(error.message); return }
      toast.success('Memória atualizada! ✨')
    } else {
      const { error } = await supabase.from('memories').insert({ ...form, criado_por: userEmail ?? 'casal' })
      if (error) { toast.error(error.message); return }
      toast.success('Memória criada! ❤️')
    }
    resetForm()
    loadMemories()
  }

  async function deleteMemory(id: string) {
    if (!confirm('Excluir esta memória?')) return
    await supabase.from('memories').delete().eq('id', id)
    setMemories(prev => prev.filter(m => m.id !== id))
    toast.success('Memória excluída')
  }

  const filtered = search
    ? memories.filter(m =>
        m.titulo.toLowerCase().includes(search.toLowerCase()) ||
        m.descricao?.toLowerCase().includes(search.toLowerCase()) ||
        m.local?.toLowerCase().includes(search.toLowerCase())
      )
    : memories

  const grouped = filtered.reduce((acc, m) => {
    const year = m.data.slice(0, 4)
    if (!acc[year]) acc[year] = []
    acc[year].push(m)
    return acc
  }, {} as Record<string, Memory[]>)

  return (
    <div className="flex flex-col flex-1">
      <Header title="Linha do Tempo" subtitle={`${memories.length} memórias`} />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        <div className="flex gap-3 items-center">
          <div className="flex-1">
            <Input placeholder="Pesquisar memórias..." value={search} onChange={e => setSearch(e.target.value)} icon={<Search className="w-4 h-4" />} />
          </div>
          <Button variant="gradient" size="sm" onClick={() => { resetForm(); setShowForm(true) }}>
            <Plus className="w-4 h-4" /> Nova Memória
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
                className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{editing ? 'Editar Memória' : 'Nova Memória'}</h3>
                  <button onClick={resetForm}><X className="w-5 h-5 text-muted-foreground" /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Emoji" value={form.emoji} onChange={e => setForm(p => ({ ...p, emoji: e.target.value }))} className="w-20 text-center text-xl" />
                    <Input placeholder="Título da memória *" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} className="flex-1" required />
                  </div>
                  <Input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))} required />
                  <textarea
                    placeholder="Conte mais sobre este momento..."
                    value={form.descricao}
                    onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
                    className="w-full min-h-[100px] rounded-xl border border-input bg-background/50 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Local" value={form.local} onChange={e => setForm(p => ({ ...p, local: e.target.value }))} icon={<MapPin className="w-4 h-4" />} />
                    <Input placeholder="Cidade" value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} />
                  </div>
                  <select
                    value={form.categoria}
                    onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}
                    className="w-full h-11 rounded-xl border border-input bg-background/50 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.favorito} onChange={e => setForm(p => ({ ...p, favorito: e.target.checked }))} className="rounded accent-rose-500" />
                    <span className="text-sm">Marcar como favorita ❤️</span>
                  </label>
                  <div className="flex gap-2 pt-2">
                    <Button type="button" variant="ghost" className="flex-1" onClick={resetForm}>Cancelar</Button>
                    <Button type="submit" variant="gradient" className="flex-1">
                      {editing ? 'Salvar' : 'Criar Memória'}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timeline */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🕰️</div>
            <p className="text-lg font-medium">Nenhuma memória ainda</p>
            <p className="text-muted-foreground text-sm">Clique em "Nova Memória" para começar sua história</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-rose-500/50 via-purple-500/50 to-transparent" />

            <div className="space-y-2">
              {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearMemories]) => (
                <div key={year}>
                  {/* Year badge */}
                  <div className="flex items-center gap-3 mb-3 mt-6">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold z-10 relative" />
                    </div>
                    <span className="text-2xl font-bold gradient-text">{year}</span>
                    <span className="text-sm text-muted-foreground">({yearMemories.length} memórias)</span>
                  </div>

                  {yearMemories.map((memory, i) => (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex gap-4 mb-4 pl-2"
                    >
                      {/* Dot */}
                      <div className="flex flex-col items-center shrink-0 w-14">
                        <div className="w-7 h-7 rounded-full glass border-2 border-rose-500/50 flex items-center justify-center z-10 text-sm">
                          {memory.emoji}
                        </div>
                      </div>

                      {/* Card */}
                      <div className="glass-card p-4 flex-1 hover:border-rose-500/30 transition-colors group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{memory.titulo}</h4>
                              {memory.favorito && <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0" />}
                              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                {CATEGORIES.find(c => c.value === memory.categoria)?.emoji} {memory.categoria}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateLong(memory.data)}
                              </span>
                              {memory.local && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {memory.local}
                                  {memory.cidade && `, ${memory.cidade}`}
                                </span>
                              )}
                            </div>
                            {memory.descricao && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{memory.descricao}</p>
                            )}
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => openEdit(memory)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteMemory(memory.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
