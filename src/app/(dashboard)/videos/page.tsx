'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Heart, X, Play, Film, Trash2, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadZone } from '@/components/features/upload-zone'
import { formatDate } from '@/lib/utils'
import type { Video } from '@/types'
import toast from 'react-hot-toast'

const CATEGORIES = ['Todos', 'geral', 'namoro', 'viagem', 'aniversario', 'familia', 'amigos']

export default function VideosPage() {
  const supabase = createClient()
  const [videos, setVideos] = useState<Video[]>([])
  const [filtered, setFiltered] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')
  const [showUpload, setShowUpload] = useState(false)
  const [player, setPlayer] = useState<Video | null>(null)
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  useEffect(() => { loadVideos() }, [])

  useEffect(() => {
    let result = videos
    if (search) result = result.filter(v =>
      v.titulo?.toLowerCase().includes(search.toLowerCase()) ||
      v.descricao?.toLowerCase().includes(search.toLowerCase()) ||
      v.local?.toLowerCase().includes(search.toLowerCase())
    )
    if (category !== 'Todos') result = result.filter(v => v.categoria === category)
    if (onlyFavorites) result = result.filter(v => v.favorito)
    setFiltered(result)
  }, [videos, search, category, onlyFavorites])

  async function loadVideos() {
    setLoading(true)
    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false })
    setVideos(data ?? [])
    setLoading(false)
  }

  async function toggleFavorite(video: Video) {
    await supabase.from('videos').update({ favorito: !video.favorito }).eq('id', video.id)
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, favorito: !v.favorito } : v))
    if (player?.id === video.id) setPlayer(prev => prev ? { ...prev, favorito: !prev.favorito } : null)
  }

  async function deleteVideo(video: Video) {
    if (!confirm('Tem certeza que deseja excluir este vídeo?')) return
    const path = video.url.split('/videos/')[1]
    if (path) await supabase.storage.from('videos').remove([path])
    await supabase.from('videos').delete().eq('id', video.id)
    setVideos(prev => prev.filter(v => v.id !== video.id))
    if (player?.id === video.id) setPlayer(null)
    toast.success('Vídeo excluído')
  }

  async function handleUploadComplete(urls: string[]) {
    const { data: userData } = await supabase.auth.getUser()
    const inserts = urls.map(url => ({
      url,
      adicionado_por: userData.user?.id,
      categoria: 'geral',
    }))
    await supabase.from('videos').insert(inserts)
    loadVideos()
    setShowUpload(false)
    toast.success('Vídeos adicionados!')
  }

  function formatDuration(seconds: number | null) {
    if (!seconds) return ''
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Vídeos" subtitle={`${filtered.length} vídeo${filtered.length !== 1 ? 's' : ''}`} />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Pesquisar vídeos..."
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
          <Button variant="gradient" size="sm" onClick={() => setShowUpload(!showUpload)}>
            <Plus className="w-4 h-4" />
            Adicionar
          </Button>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Upload zone */}
        <AnimatePresence>
          {showUpload && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Adicionar vídeos</h3>
                <button onClick={() => setShowUpload(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <UploadZone bucket="videos" onUploadComplete={handleUploadComplete} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="skeleton aspect-video rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film className="w-16 h-16 text-rose-500/30 mb-4" />
            <p className="text-lg font-medium">Nenhum vídeo encontrado</p>
            <p className="text-muted-foreground text-sm mt-1">
              {search || onlyFavorites ? 'Tente outros filtros' : 'Clique em "Adicionar" para começar'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filtered.map((video, i) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="group relative rounded-xl overflow-hidden cursor-pointer glass-card"
              >
                {/* Thumbnail */}
                <div
                  className="aspect-video bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center relative"
                  onClick={() => setPlayer(video)}
                >
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="" className="w-full h-full object-cover absolute inset-0" />
                  ) : null}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  {video.duracao && (
                    <span className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-1.5 py-0.5 rounded">
                      {formatDuration(video.duracao)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-1">{video.titulo ?? 'Vídeo sem título'}</p>
                  {video.data && (
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(video.data)}</p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <button
                      onClick={() => toggleFavorite(video)}
                      className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <Heart className={`w-3.5 h-3.5 ${video.favorito ? 'fill-rose-400 text-rose-400' : 'text-muted-foreground'}`} />
                    </button>
                    <button
                      onClick={() => deleteVideo(video)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {player && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setPlayer(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={e => e.stopPropagation()}
            >
              <video
                src={player.url}
                controls
                autoPlay
                className="w-full rounded-2xl max-h-[70vh]"
                poster={player.thumbnail_url ?? undefined}
              />

              <div className="flex items-center justify-between mt-4 px-2">
                <div>
                  <p className="text-white font-medium">{player.titulo ?? 'Vídeo sem título'}</p>
                  {player.descricao && (
                    <p className="text-white/60 text-sm mt-0.5">{player.descricao}</p>
                  )}
                  {player.data && (
                    <p className="text-white/40 text-xs mt-0.5">{formatDate(player.data)}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(player)}
                    className="p-2 rounded-xl glass text-white hover:bg-white/10"
                  >
                    <Heart className={`w-5 h-5 ${player.favorito ? 'fill-rose-400 text-rose-400' : ''}`} />
                  </button>
                  <button
                    onClick={() => deleteVideo(player)}
                    className="p-2 rounded-xl glass text-white hover:bg-red-500/20 hover:text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setPlayer(null)}
                    className="p-2 rounded-xl bg-black/50 text-white hover:bg-black/70"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
