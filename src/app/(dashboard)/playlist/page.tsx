'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Heart, X, Music2, Trash2, Edit2, ExternalLink, PlayCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PlaylistItem } from '@/types'
import toast from 'react-hot-toast'

const EMPTY_FORM = {
  nome: '',
  artista: '',
  spotify_url: '',
  youtube_url: '',
  descricao: '',
  motivo: '',
}

export default function PlaylistPage() {
  const supabase = createClient()
  const [items, setItems] = useState<PlaylistItem[]>([])
  const [filtered, setFiltered] = useState<PlaylistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<PlaylistItem | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  useEffect(() => { loadItems() }, [])

  useEffect(() => {
    let result = items
    if (search) result = result.filter(i =>
      i.nome.toLowerCase().includes(search.toLowerCase()) ||
      i.artista?.toLowerCase().includes(search.toLowerCase())
    )
    if (onlyFavorites) result = result.filter(i => i.favorito)
    setFiltered(result)
  }, [items, search, onlyFavorites])

  async function loadItems() {
    setLoading(true)
    const { data } = await supabase.from('playlist').select('*').order('ordem', { ascending: true })
    setItems(data ?? [])
    setLoading(false)
  }

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(item: PlaylistItem) {
    setEditing(item)
    setForm({
      nome: item.nome,
      artista: item.artista ?? '',
      spotify_url: item.spotify_url ?? '',
      youtube_url: item.youtube_url ?? '',
      descricao: item.descricao ?? '',
      motivo: item.motivo ?? '',
    })
    setShowModal(true)
  }

  async function saveItem() {
    if (!form.nome.trim()) { toast.error('Nome da música é obrigatório'); return }
    setSaving(true)
    const { data: userData } = await supabase.auth.getUser()
    const payload = {
      nome: form.nome,
      artista: form.artista || null,
      spotify_url: form.spotify_url || null,
      youtube_url: form.youtube_url || null,
      descricao: form.descricao || null,
      motivo: form.motivo || null,
    }
    if (editing) {
      const { error } = await supabase.from('playlist').update(payload).eq('id', editing.id)
      if (error) { toast.error('Erro ao atualizar'); setSaving(false); return }
      setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...payload } : i))
      toast.success('Música atualizada!')
    } else {
      const newItem = {
        ...payload,
        ordem: items.length + 1,
        adicionado_por: userData.user?.id ?? null,
      }
      const { data, error } = await supabase.from('playlist').insert(newItem).select().single()
      if (error) { toast.error('Erro ao adicionar'); setSaving(false); return }
      setItems(prev => [...prev, data])
      toast.success('Música adicionada! 🎵')
    }
    setSaving(false)
    setShowModal(false)
  }

  async function toggleFavorite(item: PlaylistItem) {
    await supabase.from('playlist').update({ favorito: !item.favorito }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, favorito: !i.favorito } : i))
  }

  async function deleteItem(item: PlaylistItem) {
    if (!confirm(`Excluir "${item.nome}"?`)) return
    await supabase.from('playlist').delete().eq('id', item.id)
    setItems(prev => prev.filter(i => i.id !== item.id))
    toast.success('Música removida')
  }

  function getPlayCircleId(url: string | null) {
    if (!url) return null
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
    return match?.[1] ?? null
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Nossa Playlist" subtitle={`${filtered.length} música${filtered.length !== 1 ? 's' : ''}`} />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Pesquisar músicas..."
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

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Music2 className="w-16 h-16 text-rose-500/30 mb-4" />
            <p className="text-lg font-medium">Nenhuma música encontrada</p>
            <p className="text-muted-foreground text-sm mt-1">
              {search || onlyFavorites ? 'Tente outros filtros' : 'Adicione as músicas especiais de vocês'}
            </p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {filtered.map((item, i) => {
              const ytId = getPlayCircleId(item.youtube_url)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  {/* Número / thumb */}
                  <div className="flex-shrink-0">
                    {ytId ? (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                        alt=""
                        className="w-14 h-10 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center">
                        <Music2 className="w-5 h-5 text-rose-400" />
                      </div>
                    )}
                  </div>

                  {/* Order number */}
                  <span className="text-muted-foreground text-sm w-6 flex-shrink-0 text-center">{item.ordem}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold line-clamp-1">{item.nome}</p>
                    {item.artista && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{item.artista}</p>
                    )}
                    {item.motivo && (
                      <p className="text-xs text-rose-400/70 mt-0.5 line-clamp-1 italic">"{item.motivo}"</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {item.youtube_url && (
                      <a
                        href={item.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400"
                        title="Abrir no YouTube"
                      >
                        <PlayCircle className="w-4 h-4" />
                      </a>
                    )}
                    {item.spotify_url && (
                      <a
                        href={item.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-green-500/10 transition-colors text-muted-foreground hover:text-green-400"
                        title="Abrir no Spotify"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => toggleFavorite(item)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${item.favorito ? 'fill-rose-400 text-rose-400' : 'text-muted-foreground'}`} />
                    </button>
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteItem(item)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400">
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
                    {editing ? 'Editar Música' : 'Adicionar Música'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nome da música *</label>
                    <Input
                      value={form.nome}
                      onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                      placeholder="Ex: Perfect"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Artista</label>
                    <Input
                      value={form.artista}
                      onChange={e => setForm(f => ({ ...f, artista: e.target.value }))}
                      placeholder="Ex: Ed Sheeran"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                      <PlayCircle className="w-4 h-4 text-red-400" /> Link do YouTube
                    </label>
                    <Input
                      value={form.youtube_url}
                      onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block flex items-center gap-1">
                      <ExternalLink className="w-4 h-4 text-green-400" /> Link do Spotify
                    </label>
                    <Input
                      value={form.spotify_url}
                      onChange={e => setForm(f => ({ ...f, spotify_url: e.target.value }))}
                      placeholder="https://open.spotify.com/track/..."
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Por que essa música é especial?</label>
                    <Input
                      value={form.motivo}
                      onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                      placeholder="Ex: Era a música do nosso primeiro encontro"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Descrição</label>
                    <textarea
                      value={form.descricao}
                      onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
                      placeholder="Alguma lembrança ou contexto..."
                      className="w-full h-20 bg-white/5 border border-border rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="gradient" className="flex-1" onClick={saveItem} disabled={saving}>
                    {saving ? 'Salvando...' : editing ? 'Atualizar' : 'Adicionar Música'}
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
