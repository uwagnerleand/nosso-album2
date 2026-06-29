'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Heart, X, MapPin, Trash2, Edit2, Star } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import type { Place } from '@/types'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  nome: '',
  cidade: '',
  estado: '',
  pais: 'Brasil',
  descricao: '',
  data: '',
  nota: 5,
  cover_url: '',
}

function StarRating({ nota }: { nota: number | null }) {
  const stars = nota ?? 0
  return (
    <span className="text-sm">
      {'⭐'.repeat(Math.min(Math.max(Math.round(stars), 0), 5))}
    </span>
  )
}

export default function LugaresPage() {
  const supabase = createClient()
  const [places, setPlaces] = useState<Place[]>([])
  const [filtered, setFiltered] = useState<Place[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Place | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  useEffect(() => { loadPlaces() }, [])

  useEffect(() => {
    let result = places
    if (search) result = result.filter(p =>
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.cidade?.toLowerCase().includes(search.toLowerCase()) ||
      p.pais?.toLowerCase().includes(search.toLowerCase())
    )
    if (onlyFavorites) result = result.filter(p => p.favorito)
    setFiltered(result)
  }, [places, search, onlyFavorites])

  async function loadPlaces() {
    setLoading(true)
    const { data } = await supabase.from('places').select('*').order('created_at', { ascending: false })
    setPlaces(data ?? [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(place: Place) {
    setEditing(place)
    setForm({
      nome: place.nome,
      cidade: place.cidade ?? '',
      estado: place.estado ?? '',
      pais: place.pais ?? 'Brasil',
      descricao: place.descricao ?? '',
      data: place.data ?? '',
      nota: place.nota ?? 5,
      cover_url: place.cover_url ?? '',
    })
    setShowModal(true)
  }

  async function savePlace() {
    if (!form.nome.trim()) { toast.error('Nome é obrigatório'); return }
    setSaving(true)
    const payload = {
      nome: form.nome,
      cidade: form.cidade || null,
      estado: form.estado || null,
      pais: form.pais,
      descricao: form.descricao || null,
      data: form.data || null,
      nota: form.nota,
      cover_url: form.cover_url || null,
    }
    if (editing) {
      const { error } = await supabase.from('places').update(payload).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); setSaving(false); return }
      setPlaces(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p))
      toast.success('Lugar atualizado!')
    } else {
      const { data, error } = await supabase.from('places').insert(payload).select().single()
      if (error) { toast.error('Erro ao adicionar'); setSaving(false); return }
      setPlaces(prev => [data, ...prev])
      toast.success('Lugar adicionado! 📍')
    }
    setSaving(false)
    setShowModal(false)
  }

  async function toggleFavorite(place: Place) {
    await supabase.from('places').update({ favorito: !place.favorito }).eq('id', place.id)
    setPlaces(prev => prev.map(p => p.id === place.id ? { ...p, favorito: !p.favorito } : p))
  }

  async function deletePlace(place: Place) {
    if (!confirm(`Excluir "${place.nome}"?`)) return
    await supabase.from('places').delete().eq('id', place.id)
    setPlaces(prev => prev.filter(p => p.id !== place.id))
    toast.success('Lugar removido')
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Lugares" subtitle={`${filtered.length} lugar${filtered.length !== 1 ? 'es' : ''} visitado${filtered.length !== 1 ? 's' : ''}`} />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Pesquisar lugares..."
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
            Favoritos
          </Button>
          <Button variant="gradient" size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MapPin className="w-16 h-16 text-rose-500/30 mb-4" />
            <p className="text-lg font-medium">Nenhum lugar encontrado</p>
            <p className="text-muted-foreground text-sm mt-1">
              {search || onlyFavorites ? 'Tente outros filtros' : 'Clique em "Adicionar" para registrar um lugar'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filtered.map((place, i) => (
              <motion.div
                key={place.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="glass-card overflow-hidden group"
              >
                {/* Cover */}
                <div className="h-32 relative overflow-hidden bg-gradient-to-br from-rose-500/20 to-purple-500/20">
                  {place.cover_url ? (
                    <img src={place.cover_url} alt={place.nome} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl">🗺️</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <button
                    onClick={() => toggleFavorite(place)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${place.favorito ? 'fill-rose-400 text-rose-400' : 'text-white'}`} />
                  </button>
                  <div className="absolute bottom-2 left-2">
                    <StarRating nota={place.nota} />
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-1">{place.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">
                      {[place.cidade, place.estado, place.pais].filter(Boolean).join(', ')}
                    </span>
                  </p>
                  {place.descricao && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{place.descricao}</p>
                  )}
                  {place.data && (
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(place.data)}</p>
                  )}

                  <div className="flex items-center gap-1 mt-3">
                    <button onClick={() => openEdit(place)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deletePlace(place)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal */}
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
                    {editing ? 'Editar Lugar' : 'Novo Lugar'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome do lugar *</label>
                    <Input
                      value={form.nome}
                      onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                      placeholder="Ex: Torre Eiffel"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cidade</label>
                      <Input
                        value={form.cidade}
                        onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))}
                        placeholder="Paris"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Estado</label>
                      <Input
                        value={form.estado}
                        onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}
                        placeholder="Île-de-France"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">País</label>
                    <Input
                      value={form.pais}
                      onChange={e => setForm(f => ({ ...f, pais: e.target.value }))}
                      placeholder="França"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                    <textarea
                      value={form.descricao}
                      onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                      placeholder="Como foi a visita..."
                      className="w-full h-24 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Data da visita</label>
                      <Input
                        type="date"
                        value={form.data}
                        onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Avaliação</label>
                      <select
                        value={form.nota}
                        onChange={e => setForm(f => ({ ...f, nota: Number(e.target.value) }))}
                        className="w-full bg-white/5 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                      >
                        {[1, 2, 3, 4, 5].map(n => (
                          <option key={n} value={n}>{n} {'⭐'.repeat(n)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">URL da capa (imagem)</label>
                    <Input
                      value={form.cover_url}
                      onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="gradient" className="flex-1" onClick={savePlace} disabled={saving}>
                    {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Adicionar Lugar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
