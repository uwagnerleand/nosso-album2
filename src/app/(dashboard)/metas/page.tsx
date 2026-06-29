'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Edit2, Target, CheckCircle2, Circle, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import type { Goal } from '@/types'
import toast from 'react-hot-toast'

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Circle },
  'em-progresso': { label: 'Em progresso', color: 'text-blue-400', bg: 'bg-blue-400/10', icon: Clock },
  concluida: { label: 'Concluída', color: 'text-green-400', bg: 'bg-green-400/10', icon: CheckCircle2 },
}

const CATEGORIAS = ['geral', 'viagem', 'financeiro', 'familia', 'conquista', 'saude', 'relacionamento', 'outro']

const EMPTY_FORM = {
  titulo: '',
  descricao: '',
  status: 'pendente' as Goal['status'],
  data_prevista: '',
  progresso: 0,
  emoji: '🎯',
  categoria: 'geral',
}

export default function MetasPage() {
  const supabase = createClient()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Goal | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>('todas')

  useEffect(() => { loadGoals() }, [])

  async function loadGoals() {
    setLoading(true)
    const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false })
    setGoals(data ?? [])
    setLoading(false)
  }

  const filtered = filterStatus === 'todas' ? goals : goals.filter(g => g.status === filterStatus)

  const stats = {
    total: goals.length,
    concluidas: goals.filter(g => g.status === 'concluida').length,
    emProgresso: goals.filter(g => g.status === 'em-progresso').length,
    pendentes: goals.filter(g => g.status === 'pendente').length,
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(goal: Goal) {
    setEditing(goal)
    setForm({
      titulo: goal.titulo,
      descricao: goal.descricao ?? '',
      status: goal.status,
      data_prevista: goal.data_prevista ?? '',
      progresso: goal.progresso,
      emoji: goal.emoji,
      categoria: goal.categoria,
    })
    setShowModal(true)
  }

  async function saveGoal() {
    if (!form.titulo.trim()) { toast.error('Título é obrigatório'); return }
    setSaving(true)
    const payload = {
      titulo: form.titulo,
      descricao: form.descricao || null,
      status: form.status,
      data_prevista: form.data_prevista || null,
      progresso: form.progresso,
      emoji: form.emoji,
      categoria: form.categoria,
      concluido: form.status === 'concluida',
      data_conclusao: form.status === 'concluida' ? new Date().toISOString().split('T')[0] : null,
    }
    if (editing) {
      const { error } = await supabase.from('goals').update(payload).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); setSaving(false); return }
      setGoals(prev => prev.map(g => g.id === editing.id ? { ...g, ...payload } : g))
      toast.success('Meta atualizada!')
    } else {
      const { data, error } = await supabase.from('goals').insert(payload).select().single()
      if (error) { toast.error('Erro ao adicionar'); setSaving(false); return }
      setGoals(prev => [data, ...prev])
      toast.success('Meta adicionada! 🎯')
    }
    setSaving(false)
    setShowModal(false)
  }

  async function toggleComplete(goal: Goal) {
    const newStatus: Goal['status'] = goal.status === 'concluida' ? 'pendente' : 'concluida'
    const update = {
      status: newStatus,
      concluido: newStatus === 'concluida',
      progresso: newStatus === 'concluida' ? 100 : goal.progresso,
      data_conclusao: newStatus === 'concluida' ? new Date().toISOString().split('T')[0] : null,
    }
    await supabase.from('goals').update(update).eq('id', goal.id)
    setGoals(prev => prev.map(g => g.id === goal.id ? { ...g, ...update } : g))
    if (newStatus === 'concluida') toast.success('Meta concluída! 🎉')
  }

  async function deleteGoal(goal: Goal) {
    if (!confirm(`Excluir "${goal.titulo}"?`)) return
    await supabase.from('goals').delete().eq('id', goal.id)
    setGoals(prev => prev.filter(g => g.id !== goal.id))
    toast.success('Meta removida')
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Nossas Metas" subtitle="Sonhos que queremos conquistar juntos" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, color: 'from-rose-500/20 to-purple-500/20', emoji: '🎯' },
            { label: 'Concluídas', value: stats.concluidas, color: 'from-green-500/20 to-emerald-500/20', emoji: '✅' },
            { label: 'Em progresso', value: stats.emProgresso, color: 'from-blue-500/20 to-cyan-500/20', emoji: '⏳' },
            { label: 'Pendentes', value: stats.pendentes, color: 'from-yellow-500/20 to-amber-500/20', emoji: '💤' },
          ].map(stat => (
            <div key={stat.label} className={`glass-card p-4 bg-gradient-to-br ${stat.color}`}>
              <div className="text-2xl mb-1">{stat.emoji}</div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter + Add */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex glass rounded-xl p-1 gap-1">
            {['todas', 'pendente', 'em-progresso', 'concluida'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {s === 'todas' ? 'Todas' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <Button variant="gradient" size="sm" onClick={openAdd}>
              <Plus className="w-4 h-4" />
              Nova Meta
            </Button>
          </div>
        </div>

        {/* Goals list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Target className="w-16 h-16 text-rose-500/30 mb-4" />
            <p className="text-lg font-medium">Nenhuma meta aqui</p>
            <p className="text-muted-foreground text-sm mt-1">
              {filterStatus !== 'todas' ? 'Sem metas nessa categoria' : 'Adicione sonhos e objetivos do casal'}
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {filtered.map((goal, i) => {
              const statusCfg = STATUS_CONFIG[goal.status]
              const StatusIcon = statusCfg.icon
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className={`glass-card p-4 ${goal.status === 'concluida' ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleComplete(goal)}
                      className="flex-shrink-0 mt-0.5"
                    >
                      {goal.status === 'concluida' ? (
                        <CheckCircle2 className="w-6 h-6 text-green-400 fill-green-400/20" />
                      ) : (
                        <Circle className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
                      )}
                    </button>

                    {/* Emoji */}
                    <div className="text-2xl flex-shrink-0">{goal.emoji}</div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`font-semibold ${goal.status === 'concluida' ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.titulo}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      {goal.descricao && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.descricao}</p>
                      )}

                      {/* Progress bar */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground">Progresso</span>
                          <span className="text-xs font-semibold">{goal.progresso}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${goal.progresso}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-purple-500"
                          />
                        </div>
                      </div>

                      {goal.data_prevista && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Previsão: {formatDate(goal.data_prevista)}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteGoal(goal)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>

      {/* Form Modal */}
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
                  <h2 className="text-xl font-bold gradient-text">
                    {editing ? 'Editar Meta' : 'Nova Meta'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Emoji</label>
                      <Input
                        value={form.emoji}
                        onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                        placeholder="🎯"
                        maxLength={4}
                        className="w-16 text-center text-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Título *</label>
                      <Input
                        value={form.titulo}
                        onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                        placeholder="Ex: Viajar para a Europa"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                    <textarea
                      value={form.descricao}
                      onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                      placeholder="Detalhes da meta..."
                      className="w-full h-20 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Status</label>
                      <select
                        value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as Goal['status'] }))}
                        className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em-progresso">Em progresso</option>
                        <option value="concluida">Concluída</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Categoria</label>
                      <select
                        value={form.categoria}
                        onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                        className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      >
                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Data prevista</label>
                    <Input
                      type="date"
                      value={form.data_prevista}
                      onChange={e => setForm(f => ({ ...f, data_prevista: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center justify-between">
                      Progresso
                      <span className="font-bold text-rose-400">{form.progresso}%</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={form.progresso}
                      onChange={e => setForm(f => ({ ...f, progresso: Number(e.target.value) }))}
                      className="w-full accent-rose-500"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="gradient" className="flex-1" onClick={saveGoal} disabled={saving}>
                    {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Adicionar Meta'}
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
