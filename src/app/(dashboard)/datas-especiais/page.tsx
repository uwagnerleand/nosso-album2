'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Trash2, Edit2, Calendar, Bell, BellOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDateLong } from '@/lib/utils'
import { differenceInDays, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { SpecialDate } from '@/types'
import toast from 'react-hot-toast'

const TIPOS = [
  { value: 'namoro', label: 'Namoro', emoji: '❤️' },
  { value: 'casamento', label: 'Casamento', emoji: '💒' },
  { value: 'aniversario', label: 'Aniversário', emoji: '🎂' },
  { value: 'primeiro-beijo', label: 'Primeiro Beijo', emoji: '💋' },
  { value: 'outro', label: 'Outro', emoji: '✨' },
]

const EMPTY_FORM = {
  titulo: '',
  data: '',
  tipo: 'outro',
  descricao: '',
  emoji: '❤️',
  cor: '#ec4899',
  lembrete: true,
}

function calcDiasRestantes(data: string) {
  const hoje = new Date()
  const d = parseISO(data)
  const proximoAno = new Date(hoje.getFullYear(), d.getMonth(), d.getDate())
  if (proximoAno < hoje) proximoAno.setFullYear(hoje.getFullYear() + 1)
  return differenceInDays(proximoAno, hoje)
}

export default function DatasEspeciaisPage() {
  const supabase = createClient()
  const [dates, setDates] = useState<SpecialDate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<SpecialDate | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadDates() }, [])

  async function loadDates() {
    setLoading(true)
    const { data } = await supabase.from('special_dates').select('*').order('data')
    setDates(data ?? [])
    setLoading(false)
  }

  const sorted = [...dates].sort((a, b) => calcDiasRestantes(a.data) - calcDiasRestantes(b.data))

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(d: SpecialDate) {
    setEditing(d)
    setForm({
      titulo: d.titulo,
      data: d.data,
      tipo: d.tipo,
      descricao: d.descricao ?? '',
      emoji: d.emoji,
      cor: d.cor,
      lembrete: d.lembrete,
    })
    setShowModal(true)
  }

  async function saveDate() {
    if (!form.titulo.trim() || !form.data) { toast.error('Título e data são obrigatórios'); return }
    setSaving(true)
    const payload = {
      titulo: form.titulo,
      data: form.data,
      tipo: form.tipo,
      descricao: form.descricao || null,
      emoji: form.emoji,
      cor: form.cor,
      lembrete: form.lembrete,
    }
    if (editing) {
      const { error } = await supabase.from('special_dates').update(payload).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); setSaving(false); return }
      setDates(prev => prev.map(d => d.id === editing.id ? { ...d, ...payload } : d))
      toast.success('Data atualizada!')
    } else {
      const { data, error } = await supabase.from('special_dates').insert(payload).select().single()
      if (error) { toast.error('Erro ao adicionar'); setSaving(false); return }
      setDates(prev => [...prev, data])
      toast.success('Data especial adicionada! 🗓️')
    }
    setSaving(false)
    setShowModal(false)
  }

  async function deleteDate(d: SpecialDate) {
    if (!confirm(`Excluir "${d.titulo}"?`)) return
    await supabase.from('special_dates').delete().eq('id', d.id)
    setDates(prev => prev.filter(item => item.id !== d.id))
    toast.success('Data removida')
  }

  function getAnoAtual(data: string) {
    const d = parseISO(data)
    return format(d, "dd 'de' MMMM", { locale: ptBR })
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Datas Especiais" subtitle="Momentos que marcaram nossa história" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Header action */}
        <div className="flex justify-end">
          <Button variant="gradient" size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Adicionar Data
          </Button>
        </div>

        {/* Cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Calendar className="w-16 h-16 text-rose-500/30 mb-4" />
            <p className="text-lg font-medium">Nenhuma data especial</p>
            <p className="text-muted-foreground text-sm mt-1">
              Adicione datas importantes do relacionamento
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {sorted.map((item, i) => {
              const diasRestantes = calcDiasRestantes(item.data)
              const isHoje = diasRestantes === 0
              const tipo = TIPOS.find(t => t.value === item.tipo)

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.3) }}
                  className={`glass-card p-4 flex items-center gap-4 relative overflow-hidden ${isHoje ? 'ring-2 ring-rose-500/50' : ''}`}
                >
                  {/* Gradient accent */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: item.cor }}
                  />

                  {/* Emoji */}
                  <div className="text-3xl w-12 h-12 flex items-center justify-center glass rounded-xl flex-shrink-0">
                    {item.emoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{item.titulo}</h3>
                      {tipo && (
                        <span className="text-xs px-2 py-0.5 rounded-full glass text-muted-foreground">
                          {tipo.emoji} {tipo.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{getAnoAtual(item.data)}</p>
                    {item.descricao && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{item.descricao}</p>
                    )}
                  </div>

                  {/* Countdown */}
                  <div className="text-right flex-shrink-0">
                    {isHoje ? (
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-bold"
                      >
                        🎉 Hoje!
                      </motion.div>
                    ) : diasRestantes <= 7 ? (
                      <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 text-sm font-semibold">
                        em {diasRestantes} dias
                      </div>
                    ) : (
                      <div className="text-right">
                        <p className="text-2xl font-bold gradient-text">{diasRestantes}</p>
                        <p className="text-xs text-muted-foreground">dias</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteDate(item)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
                    {editing ? 'Editar Data' : 'Nova Data Especial'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Título *</label>
                    <Input
                      value={form.titulo}
                      onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                      placeholder="Ex: Aniversário de namoro"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Data *</label>
                    <Input
                      type="date"
                      value={form.data}
                      onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Tipo</label>
                    <select
                      value={form.tipo}
                      onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                      className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    >
                      {TIPOS.map(t => (
                        <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Emoji</label>
                      <Input
                        value={form.emoji}
                        onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
                        placeholder="❤️"
                        maxLength={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cor</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={form.cor}
                          onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
                          className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                        />
                        <Input
                          value={form.cor}
                          onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
                          placeholder="#ec4899"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                    <textarea
                      value={form.descricao}
                      onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                      placeholder="Conte um pouco sobre esse dia..."
                      className="w-full h-20 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      className={`w-10 h-6 rounded-full transition-colors ${form.lembrete ? 'bg-rose-500' : 'bg-white/10'}`}
                      onClick={() => setForm(f => ({ ...f, lembrete: !f.lembrete }))}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white shadow-sm m-0.5 transition-transform ${form.lembrete ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm flex items-center gap-1">
                      {form.lembrete ? <Bell className="w-3.5 h-3.5 text-rose-400" /> : <BellOff className="w-3.5 h-3.5 text-muted-foreground" />}
                      Lembrete ativado
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="gradient" className="flex-1" onClick={saveDate} disabled={saving}>
                    {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Adicionar Data'}
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
