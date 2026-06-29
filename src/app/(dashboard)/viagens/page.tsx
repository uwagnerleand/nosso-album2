'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Heart, X, Plane, Trash2, Edit2, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate, formatDateLong } from '@/lib/utils'
import { differenceInDays, parseISO } from 'date-fns'
import type { Travel } from '@/types'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  destino: '',
  cidade: '',
  estado: '',
  pais: '',
  data_inicio: '',
  data_fim: '',
  descricao: '',
  diario: '',
  cover_url: '',
}

export default function ViagensPage() {
  const supabase = createClient()
  const [travels, setTravels] = useState<Travel[]>([])
  const [filtered, setFiltered] = useState<Travel[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Travel | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [onlyFavorites, setOnlyFavorites] = useState(false)
  const [viewTravel, setViewTravel] = useState<Travel | null>(null)

  useEffect(() => { loadTravels() }, [])

  useEffect(() => {
    let result = travels
    if (search) result = result.filter(t =>
      t.destino.toLowerCase().includes(search.toLowerCase()) ||
      t.cidade?.toLowerCase().includes(search.toLowerCase()) ||
      t.pais?.toLowerCase().includes(search.toLowerCase())
    )
    if (onlyFavorites) result = result.filter(t => t.favorito)
    setFiltered(result)
  }, [travels, search, onlyFavorites])

  async function loadTravels() {
    setLoading(true)
    const { data } = await supabase.from('travels').select('*').order('data_inicio', { ascending: false })
    setTravels(data ?? [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(travel: Travel) {
    setEditing(travel)
    setForm({
      destino: travel.destino,
      cidade: travel.cidade ?? '',
      estado: travel.estado ?? '',
      pais: travel.pais ?? '',
      data_inicio: travel.data_inicio ?? '',
      data_fim: travel.data_fim ?? '',
      descricao: travel.descricao ?? '',
      diario: travel.diario ?? '',
      cover_url: travel.cover_url ?? '',
    })
    setShowModal(true)
  }

  async function saveTravel() {
    if (!form.destino.trim()) { toast.error('Destino é obrigatório'); return }
    setSaving(true)
    const payload = {
      destino: form.destino,
      cidade: form.cidade || null,
      estado: form.estado || null,
      pais: form.pais || null,
      data_inicio: form.data_inicio || null,
      data_fim: form.data_fim || null,
      descricao: form.descricao || null,
      diario: form.diario || null,
      cover_url: form.cover_url || null,
    }
    if (editing) {
      const { error } = await supabase.from('travels').update(payload).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); setSaving(false); return }
      setTravels(prev => prev.map(t => t.id === editing.id ? { ...t, ...payload } : t))
      toast.success('Viagem atualizada!')
    } else {
      const { data, error } = await supabase.from('travels').insert(payload).select().single()
      if (error) { toast.error('Erro ao adicionar'); setSaving(false); return }
      setTravels(prev => [data, ...prev])
      toast.success('Viagem adicionada! ✈️')
    }
    setSaving(false)
    setShowModal(false)
  }

  async function toggleFavorite(travel: Travel) {
    await supabase.from('travels').update({ favorito: !travel.favorito }).eq('id', travel.id)
    setTravels(prev => prev.map(t => t.id === travel.id ? { ...t, favorito: !t.favorito } : t))
    if (viewTravel?.id === travel.id) setViewTravel(prev => prev ? { ...prev, favorito: !prev.favorito } : null)
  }

  async function deleteTravel(travel: Travel) {
    if (!confirm(`Excluir viagem para "${travel.destino}"?`)) return
    await supabase.from('travels').delete().eq('id', travel.id)
    setTravels(prev => prev.filter(t => t.id !== travel.id))
    if (viewTravel?.id === travel.id) setViewTravel(null)
    toast.success('Viagem removida')
  }

  function getDuration(travel: Travel) {
    if (!travel.data_inicio || !travel.data_fim) return null
    const days = differenceInDays(parseISO(travel.data_fim), parseISO(travel.data_inicio))
    return days > 0 ? `${days} dia${days !== 1 ? 's' : ''}` : 'Mesmo dia'
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Viagens" subtitle={`${filtered.length} viage${filtered.length !== 1 ? 'ns' : 'm'}`} />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Pesquisar viagens..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant={onlyFavorites ? 'default' : 'outline'}
            size="sm"
            onClick={() => setOnlyFavorites(!onlyFavorites)}
          >
            <Heart className={onlyFavorites ? 'fill-current w-4 h-4' : 'w-4 h-4'} />
            Favoritas
          </Button>
          <Button variant="gradient" size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Plane className="w-16 h-16 text-rose-500/30 mb-4" />
            <p className="text-lg font-medium">Nenhuma viagem encontrada</p>
            <p className="text-muted-foreground text-sm mt-1">
              {search || onlyFavorites ? 'Tente outros filtros' : 'Clique em "Adicionar" para registrar uma viagem'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((travel, i) => (
              <motion.div
                key={travel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="glass-card overflow-hidden group cursor-pointer"
                onClick={() => setViewTravel(travel)}
              >
                {/* Cover */}
                <div className="h-40 relative overflow-hidden bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                  {travel.cover_url ? (
                    <img src={travel.cover_url} alt={travel.destino} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-5xl">✈️</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(travel) }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${travel.favorito ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                  </button>
                  {getDuration(travel) && (
                    <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                      {getDuration(travel)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-lg line-clamp-1">{travel.destino}</h3>
                  {(travel.cidade || travel.pais) && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {[travel.cidade, travel.estado, travel.pais].filter(Boolean).join(', ')}
                    </p>
                  )}
                  {travel.data_inicio && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {formatDate(travel.data_inicio)}
                        {travel.data_fim ? ` – ${formatDate(travel.data_fim)}` : ''}
                      </span>
                    </div>
                  )}
                  {travel.descricao && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{travel.descricao}</p>
                  )}

                  <div className="flex items-center gap-1 mt-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(travel)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteTravel(travel)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* View Modal */}
      <AnimatePresence>
        {viewTravel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setViewTravel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Cover */}
              <div className="h-48 relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                {viewTravel.cover_url ? (
                  <img src={viewTravel.cover_url} alt={viewTravel.destino} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-6xl">✈️</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-6 right-16">
                  <h2 className="text-2xl font-bold text-white">{viewTravel.destino}</h2>
                  {(viewTravel.cidade || viewTravel.pais) && (
                    <p className="text-white/70 text-sm">
                      {[viewTravel.cidade, viewTravel.estado, viewTravel.pais].filter(Boolean).join(', ')}
                    </p>
                  )}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button onClick={() => toggleFavorite(viewTravel)} className="p-2 rounded-xl bg-black/40 text-white hover:bg-black/60">
                    <Heart className={`w-4 h-4 ${viewTravel.favorito ? 'fill-rose-400 text-rose-400' : ''}`} />
                  </button>
                  <button onClick={() => setViewTravel(null)} className="p-2 rounded-xl bg-black/40 text-white hover:bg-black/60">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Dates */}
                {viewTravel.data_inicio && (
                  <div className="flex items-center gap-3 glass rounded-xl p-3">
                    <Calendar className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium">
                        {formatDateLong(viewTravel.data_inicio)}
                        {viewTravel.data_fim ? ` → ${formatDateLong(viewTravel.data_fim)}` : ''}
                      </p>
                      {getDuration(viewTravel) && (
                        <p className="text-xs text-muted-foreground">{getDuration(viewTravel)}</p>
                      )}
                    </div>
                  </div>
                )}

                {viewTravel.descricao && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Descrição</h4>
                    <p className="text-sm leading-relaxed">{viewTravel.descricao}</p>
                  </div>
                )}

                {viewTravel.diario && (
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-1">Diário de viagem 📔</h4>
                    <div className="glass rounded-xl p-4 text-sm leading-relaxed whitespace-pre-wrap">
                      {viewTravel.diario}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setViewTravel(null); openEdit(viewTravel) }}
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => deleteTravel(viewTravel)}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    {editing ? 'Editar Viagem' : 'Nova Viagem'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Destino *</label>
                    <Input
                      value={form.destino}
                      onChange={e => setForm(f => ({ ...f, destino: e.target.value }))}
                      placeholder="Ex: Paris, França"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cidade</label>
                      <Input value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} placeholder="Paris" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Estado</label>
                      <Input value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} placeholder="Île-de-France" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">País</label>
                      <Input value={form.pais} onChange={e => setForm(f => ({ ...f, pais: e.target.value }))} placeholder="França" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Data de início</label>
                      <Input type="date" value={form.data_inicio} onChange={e => setForm(f => ({ ...f, data_inicio: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Data de fim</label>
                      <Input type="date" value={form.data_fim} onChange={e => setForm(f => ({ ...f, data_fim: e.target.value }))} />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                    <textarea
                      value={form.descricao}
                      onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                      placeholder="Uma breve descrição da viagem..."
                      className="w-full h-20 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Diário de viagem 📔</label>
                    <textarea
                      value={form.diario}
                      onChange={e => setForm(f => ({ ...f, diario: e.target.value }))}
                      placeholder="Escreva suas memórias, experiências e histórias dessa viagem..."
                      className="w-full h-32 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">URL da capa</label>
                    <Input value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} placeholder="https://..." />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="gradient" className="flex-1" onClick={saveTravel} disabled={saving}>
                    {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Adicionar Viagem'}
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
