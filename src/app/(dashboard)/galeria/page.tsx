'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, Heart, Download, X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUserEmail } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UploadZone } from '@/components/features/upload-zone'
import { formatDate } from '@/lib/utils'
import type { Photo } from '@/types'
import toast from 'react-hot-toast'

const CATEGORIES = ['Todas', 'geral', 'namoro', 'viagem', 'aniversario', 'familia', 'amigos']

export default function GaleriaPage() {
  const supabase = createClient()

  const [photos, setPhotos] = useState<Photo[]>([])
  const [filtered, setFiltered] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todas')
  const [showUpload, setShowUpload] = useState(false)
  const [lightbox, setLightbox] = useState<{ photo: Photo; index: number } | null>(null)
  const [onlyFavorites, setOnlyFavorites] = useState(false)

  useEffect(() => { loadPhotos() }, [])

  useEffect(() => {
    let result = photos
    if (search) result = result.filter(p => p.legenda?.toLowerCase().includes(search.toLowerCase()) || p.local?.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'Todas') result = result.filter(p => p.categoria === category)
    if (onlyFavorites) result = result.filter(p => p.favorito)
    setFiltered(result)
  }, [photos, search, category, onlyFavorites])

  async function loadPhotos() {
    setLoading(true)
    const { data } = await supabase.from('photos').select('*').order('created_at', { ascending: false })
    setPhotos(data ?? [])
    setLoading(false)
  }

  async function toggleFavorite(photo: Photo) {
    await supabase.from('photos').update({ favorito: !photo.favorito }).eq('id', photo.id)
    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, favorito: !p.favorito } : p))
  }

  async function deletePhoto(photo: Photo) {
    if (!confirm('Tem certeza que deseja excluir esta foto?')) return
    const path = photo.url.split('/photos/')[1]
    await supabase.storage.from('photos').remove([path])
    await supabase.from('photos').delete().eq('id', photo.id)
    setPhotos(prev => prev.filter(p => p.id !== photo.id))
    setLightbox(null)
    toast.success('Foto excluída')
  }

  async function handleUploadComplete(urls: string[]) {
    const inserts = urls.map(url => ({
      url,
      adicionado_por: getCurrentUserEmail() ?? 'casal',
      categoria: 'geral',
    }))
    await supabase.from('photos').insert(inserts)
    loadPhotos()
    setShowUpload(false)
  }

  function openLightbox(photo: Photo) {
    const index = filtered.findIndex(p => p.id === photo.id)
    setLightbox({ photo, index })
  }

  function navLightbox(dir: -1 | 1) {
    if (!lightbox) return
    const newIndex = lightbox.index + dir
    if (newIndex < 0 || newIndex >= filtered.length) return
    setLightbox({ photo: filtered[newIndex], index: newIndex })
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Galeria" subtitle={`${filtered.length} fotos`} />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex-1 min-w-48">
            <Input
              placeholder="Pesquisar fotos..."
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
                <h3 className="font-semibold">Adicionar fotos</h3>
                <button onClick={() => setShowUpload(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <UploadZone bucket="photos" onUploadComplete={handleUploadComplete} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pinterest grid */}
        {loading ? (
          <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="skeleton break-inside-avoid mb-3"
                style={{ height: `${150 + (i % 3) * 80}px`, borderRadius: '12px' }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-lg font-medium">Nenhuma foto encontrada</p>
            <p className="text-muted-foreground text-sm mt-1">
              {search || onlyFavorites ? 'Tente outros filtros' : 'Clique em "Adicionar" para começar'}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3"
          >
            {filtered.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="break-inside-avoid mb-3 group relative rounded-xl overflow-hidden cursor-pointer"
                onClick={() => openLightbox(photo)}
              >
                <img
                  src={photo.url}
                  alt={photo.legenda ?? ''}
                  className="w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                  <div className="absolute bottom-2 left-2 right-2">
                    {photo.legenda && (
                      <p className="text-white text-xs font-medium line-clamp-2">{photo.legenda}</p>
                    )}
                  </div>
                  <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                    onClick={e => { e.stopPropagation(); toggleFavorite(photo) }}
                  >
                    <Heart className={`w-3.5 h-3.5 ${photo.favorito ? 'fill-rose-400 text-rose-400' : ''}`} />
                  </button>
                </div>
                {photo.favorito && (
                  <div className="absolute top-2 left-2">
                    <Heart className="w-4 h-4 fill-rose-400 text-rose-400 drop-shadow-sm" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={lightbox.photo.url}
                alt=""
                className="max-w-full max-h-[80vh] object-contain rounded-2xl mx-auto block"
              />

              {/* Controls */}
              <div className="flex items-center justify-between mt-4 px-2">
                <div>
                  <p className="text-white font-medium">{lightbox.photo.legenda}</p>
                  {lightbox.photo.data && (
                    <p className="text-white/60 text-sm">{formatDate(lightbox.photo.data)}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(lightbox.photo)}
                    className="p-2 rounded-xl glass text-white hover:bg-white/10"
                  >
                    <Heart className={`w-5 h-5 ${lightbox.photo.favorito ? 'fill-rose-400 text-rose-400' : ''}`} />
                  </button>
                  <a
                    href={lightbox.photo.url}
                    download
                    className="p-2 rounded-xl glass text-white hover:bg-white/10"
                    onClick={e => e.stopPropagation()}
                  >
                    <Download className="w-5 h-5" />
                  </a>
                  <button
                    onClick={() => deletePhoto(lightbox.photo)}
                    className="p-2 rounded-xl glass text-white hover:bg-red-500/20 hover:text-red-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Nav arrows */}
              {lightbox.index > 0 && (
                <button
                  onClick={() => navLightbox(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass text-white hover:bg-white/10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {lightbox.index < filtered.length - 1 && (
                <button
                  onClick={() => navLightbox(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full glass text-white hover:bg-white/10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Close */}
              <button
                onClick={() => setLightbox(null)}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
