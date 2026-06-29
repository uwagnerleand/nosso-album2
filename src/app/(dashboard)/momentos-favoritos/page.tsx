'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Camera, Clock, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { formatDateLong } from '@/lib/utils'
import type { Memory, Photo } from '@/types'
import Link from 'next/link'

export default function MomentosFavoritosPage() {
  const supabase = createClient()
  const [favoriteMemories, setFavoriteMemories] = useState<Memory[]>([])
  const [favoritePhotos, setFavoritePhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'memories' | 'photos'>('memories')

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: memories }, { data: photos }] = await Promise.all([
        supabase.from('memories').select('*').eq('favorito', true).order('data', { ascending: false }),
        supabase.from('photos').select('*').eq('favorito', true).order('created_at', { ascending: false }),
      ])
      setFavoriteMemories(memories ?? [])
      setFavoritePhotos(photos ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const tabs = [
    { key: 'memories', label: 'Memórias', count: favoriteMemories.length, icon: Heart },
    { key: 'photos', label: 'Fotos', count: favoritePhotos.length, icon: Camera },
  ]

  return (
    <div className="flex flex-col flex-1">
      <Header title="Momentos Favoritos" subtitle="Os melhores capítulos da nossa história" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-6 bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20 text-center"
        >
          <div className="flex justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
            ))}
          </div>
          <p className="text-muted-foreground text-sm">
            {favoriteMemories.length + favoritePhotos.length} momentos favoritos
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2">
          {tabs.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key as 'memories' | 'photos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-gradient-to-r from-rose-500 to-purple-500 text-white'
                  : 'glass text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${tab === key ? 'bg-white/20' : 'bg-muted'}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
          </div>
        ) : tab === 'memories' ? (
          favoriteMemories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">⭐</div>
              <p className="font-medium">Nenhuma memória favorita ainda</p>
              <p className="text-sm text-muted-foreground mt-1">
                Marque memórias como favoritas na Linha do Tempo
              </p>
              <Link href="/linha-do-tempo" className="text-sm text-primary hover:underline mt-2 inline-block">
                Ir para Linha do Tempo →
              </Link>
            </div>
          ) : (
            <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {favoriteMemories.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-purple-500/20 flex items-center justify-center text-xl shrink-0">
                      {m.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">{m.titulo}</h3>
                        <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 shrink-0" />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDateLong(m.data)}
                        {m.local && (
                          <>
                            <MapPin className="w-3 h-3 ml-1" />
                            {m.local}
                          </>
                        )}
                      </div>
                      {m.descricao && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.descricao}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )
        ) : (
          favoritePhotos.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📸</div>
              <p className="font-medium">Nenhuma foto favorita ainda</p>
              <Link href="/galeria" className="text-sm text-primary hover:underline mt-2 inline-block">
                Ir para Galeria →
              </Link>
            </div>
          ) : (
            <motion.div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {favoritePhotos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="break-inside-avoid mb-3 relative rounded-xl overflow-hidden group"
                >
                  <img src={photo.url} alt={photo.legenda ?? ''} className="w-full object-cover rounded-xl" loading="lazy" />
                  <div className="absolute top-2 left-2">
                    <Heart className="w-4 h-4 fill-rose-400 text-rose-400 drop-shadow-sm" />
                  </div>
                  {photo.legenda && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl">
                      <p className="text-white text-xs line-clamp-2">{photo.legenda}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )
        )}
      </div>
    </div>
  )
}
