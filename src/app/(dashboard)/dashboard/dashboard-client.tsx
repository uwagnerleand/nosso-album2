'use client'

import { motion } from 'framer-motion'
import { Heart, Camera, Video, MapPin, Plane, Calendar, Clock, Star, Sparkles } from 'lucide-react'
import { useTimeCounter } from '@/hooks/useTimeCounter'
import { calcularProximoAniversario, formatDateLong } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import type { CoupleConfig, Memory } from '@/types'
import Link from 'next/link'

interface Props {
  stats: {
    totalFotos: number
    totalVideos: number
    totalLugares: number
    totalViagens: number
    totalMemories: number
    ultimaMemoria: Memory | null
  }
  datasEspeciais: Array<{ titulo: string; data: string }>
  coupleConfig: CoupleConfig | null
}

const statCards = (stats: Props['stats']) => [
  {
    icon: Camera,
    label: 'Fotos',
    value: stats.totalFotos,
    color: 'from-rose-500 to-pink-500',
    href: '/galeria',
    emoji: '📷',
  },
  {
    icon: Video,
    label: 'Vídeos',
    value: stats.totalVideos,
    color: 'from-purple-500 to-violet-500',
    href: '/videos',
    emoji: '🎥',
  },
  {
    icon: MapPin,
    label: 'Lugares',
    value: stats.totalLugares,
    color: 'from-blue-500 to-cyan-500',
    href: '/lugares',
    emoji: '📍',
  },
  {
    icon: Plane,
    label: 'Viagens',
    value: stats.totalViagens,
    color: 'from-emerald-500 to-teal-500',
    href: '/viagens',
    emoji: '✈️',
  },
]

export function DashboardClient({ stats, datasEspeciais, coupleConfig }: Props) {
  const time = useTimeCounter(coupleConfig?.data_inicio_namoro ?? null)
  const proximoAniversario = calcularProximoAniversario(datasEspeciais)

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex flex-col flex-1">
      <Header
        title="Dashboard"
        subtitle={coupleConfig?.nome_casal ?? 'Nosso Álbum'}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-purple-500/10 border border-rose-500/20"
        >
          <div className="absolute top-0 right-0 text-6xl opacity-20 select-none pointer-events-none">❤️</div>
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              {coupleConfig?.frase_personalizada ?? 'Cada memória é um capítulo da nossa história.'}
            </p>
            <h2 className="text-2xl font-bold gradient-text">
              {coupleConfig?.nome_casal ?? 'Nosso Álbum'} 💑
            </h2>
            {coupleConfig?.data_inicio_namoro && (
              <p className="text-sm text-muted-foreground mt-1">
                Juntos desde {formatDateLong(coupleConfig.data_inicio_namoro)}
              </p>
            )}
          </div>
        </motion.div>

        {/* Time counter */}
        {coupleConfig?.data_inicio_namoro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
              <h3 className="font-semibold">Tempo Juntos</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { label: 'Anos', value: time.anos },
                { label: 'Meses', value: time.meses },
                { label: 'Dias', value: time.dias },
                { label: 'Horas', value: time.horas },
                { label: 'Minutos', value: time.minutos },
                { label: 'Segundos', value: time.segundos },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex flex-col items-center p-3 rounded-xl bg-gradient-to-b from-rose-500/10 to-transparent border border-rose-500/10"
                >
                  <span className="text-2xl font-bold gradient-text tabular-nums">
                    {String(value).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-3">
              🗓️ {time.totalDias.toLocaleString('pt-BR')} dias juntos
            </p>
          </motion.div>
        )}

        {/* Stats grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {statCards(stats).map(({ icon: Icon, label, value, color, href, emoji }) => (
            <motion.div key={label} variants={item}>
              <Link href={href}>
                <div className="glass-card p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer group">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{value.toLocaleString('pt-BR')}</p>
                  <p className="text-sm text-muted-foreground">{emoji} {label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Total memórias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold">Memórias</h3>
            </div>
            <p className="text-3xl font-bold gradient-text">{stats.totalMemories}</p>
            <p className="text-sm text-muted-foreground">momentos registrados</p>
            <Link href="/linha-do-tempo" className="text-xs text-primary hover:underline mt-2 inline-block">
              Ver linha do tempo →
            </Link>
          </motion.div>

          {/* Próximo aniversário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold">Próxima Data</h3>
            </div>
            {proximoAniversario ? (
              <>
                <p className="font-medium">{proximoAniversario.titulo}</p>
                <p className="text-sm text-muted-foreground">{formatDateLong(proximoAniversario.data)}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                  <span className="text-xs font-medium text-rose-400">
                    {proximoAniversario.diasRestantes === 0
                      ? '🎉 Hoje!'
                      : `em ${proximoAniversario.diasRestantes} dias`}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma data especial cadastrada</p>
            )}
            <Link href="/datas-especiais" className="text-xs text-primary hover:underline mt-2 inline-block">
              Ver todas as datas →
            </Link>
          </motion.div>

          {/* Última memória */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold">Última Memória</h3>
            </div>
            {stats.ultimaMemoria ? (
              <>
                <p className="font-medium line-clamp-1">
                  {stats.ultimaMemoria.emoji} {stats.ultimaMemoria.titulo}
                </p>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {stats.ultimaMemoria.descricao}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma memória ainda</p>
            )}
            <Link href="/linha-do-tempo" className="text-xs text-primary hover:underline mt-2 inline-block">
              Ver memórias →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
