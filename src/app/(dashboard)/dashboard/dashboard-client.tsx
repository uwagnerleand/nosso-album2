'use client'

import { motion } from 'framer-motion'
import { Heart, Camera, Video, MapPin, Plane, Calendar, Clock, Star, Sparkles, ArrowRight } from 'lucide-react'
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
    color: 'from-pink-500 via-rose-500 to-fuchsia-600',
    glow: 'shadow-pink-500/20',
    href: '/galeria',
    emoji: '📷',
  },
  {
    icon: Video,
    label: 'Vídeos',
    value: stats.totalVideos,
    color: 'from-purple-500 via-indigo-500 to-violet-600',
    glow: 'shadow-purple-500/20',
    href: '/videos',
    emoji: '🎥',
  },
  {
    icon: MapPin,
    label: 'Lugares',
    value: stats.totalLugares,
    color: 'from-fuchsia-500 via-purple-500 to-pink-600',
    glow: 'shadow-fuchsia-500/20',
    href: '/lugares',
    emoji: '📍',
  },
  {
    icon: Plane,
    label: 'Viagens',
    value: stats.totalViagens,
    color: 'from-violet-500 via-pink-500 to-rose-600',
    glow: 'shadow-violet-500/20',
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
    <div className="flex flex-col flex-1 min-h-screen">
      <Header
        title="Dashboard"
        subtitle={coupleConfig?.nome_casal ?? 'Nosso Álbum'}
      />

      <div className="flex-1 p-4 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-pink-500/15 via-fuchsia-500/15 to-purple-600/15 border border-pink-500/30 shadow-xl shadow-pink-500/10 backdrop-blur-xl"
        >
          <div className="absolute top-0 right-4 text-7xl opacity-15 select-none pointer-events-none">❤️</div>
          <div className="relative z-10">
            <p className="text-sm text-pink-400 font-semibold mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              {coupleConfig?.frase_personalizada ?? 'Cada memória é um capítulo da nossa história.'}
            </p>
            <h2 className="text-3xl lg:text-4xl font-black gradient-text">
              {coupleConfig?.nome_casal ?? 'Nosso Álbum'} 💑
            </h2>
            {coupleConfig?.data_inicio_namoro && (
              <p className="text-sm text-purple-200/80 mt-1 font-medium">
                Juntos desde {formatDateLong(coupleConfig.data_inicio_namoro)}
              </p>
            )}
          </div>
        </motion.div>

        {/* Time counter */}
        {coupleConfig?.data_inicio_namoro && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 border-pink-500/25 shadow-xl shadow-purple-950/20"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center border border-pink-500/30">
                  <Heart className="w-4 h-4 text-pink-400 fill-pink-400 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Tempo Juntos</h3>
              </div>
              <span className="text-xs font-semibold text-pink-400 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30">
                Amor Eterno ✨
              </span>
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
                  className="flex flex-col items-center p-3.5 rounded-2xl bg-gradient-to-b from-pink-500/15 via-fuchsia-500/10 to-transparent border border-pink-500/20 shadow-sm hover:border-pink-500/40 transition-colors"
                >
                  <span className="text-2xl sm:text-3xl font-black gradient-text tabular-nums tracking-tight">
                    {String(value).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-medium text-purple-200/70 mt-1">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-purple-200/70 mt-4 font-medium">
              🗓️ <span className="font-bold text-pink-400">{time.totalDias.toLocaleString('pt-BR')}</span> dias inesquecíveis compartilhados
            </p>
          </motion.div>
        )}

        {/* Stats grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {statCards(stats).map(({ icon: Icon, label, value, color, glow, href, emoji }) => (
            <motion.div key={label} variants={item}>
              <Link href={href}>
                <div className="glass-card p-5 hover:scale-[1.03] transition-all duration-200 cursor-pointer group border-pink-500/20">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-3 shadow-lg ${glow} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl font-black text-foreground">{value.toLocaleString('pt-BR')}</p>
                  <p className="text-sm font-semibold text-purple-200/70 mt-0.5">{emoji} {label}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Total memórias */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-6 border-pink-500/20 hover:border-pink-500/35 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-pink-500/20">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Linha do Tempo</h3>
              </div>
              <p className="text-4xl font-black gradient-text">{stats.totalMemories}</p>
              <p className="text-sm font-medium text-purple-200/70 mt-1">momentos inesquecíveis</p>
            </div>
            <Link href="/linha-do-tempo" className="text-xs font-bold text-pink-400 hover:text-pink-300 mt-4 inline-flex items-center gap-1 group">
              Explorar linha do tempo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Próximo aniversário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card p-6 border-pink-500/20 hover:border-pink-500/35 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Próxima Data</h3>
              </div>
              {proximoAniversario ? (
                <>
                  <p className="font-bold text-foreground line-clamp-1">{proximoAniversario.titulo}</p>
                  <p className="text-sm font-medium text-purple-200/70">{formatDateLong(proximoAniversario.data)}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 border border-pink-500/30">
                    <span className="text-xs font-bold text-pink-400">
                      {proximoAniversario.diasRestantes === 0
                        ? '🎉 É Hoje!'
                        : `em ${proximoAniversario.diasRestantes} dias`}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-purple-200/70">Nenhuma data especial cadastrada</p>
              )}
            </div>
            <Link href="/datas-especiais" className="text-xs font-bold text-pink-400 hover:text-pink-300 mt-4 inline-flex items-center gap-1 group">
              Ver todas as datas <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Última memória */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card p-6 border-pink-500/20 hover:border-pink-500/35 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-lg text-foreground">Última Memória</h3>
              </div>
              {stats.ultimaMemoria ? (
                <>
                  <p className="font-bold text-foreground line-clamp-1">
                    {stats.ultimaMemoria.emoji} {stats.ultimaMemoria.titulo}
                  </p>
                  <p className="text-sm font-medium text-purple-200/70 line-clamp-2 mt-1">
                    {stats.ultimaMemoria.descricao}
                  </p>
                </>
              ) : (
                <p className="text-sm text-purple-200/70">Nenhuma memória ainda</p>
              )}
            </div>
            <Link href="/linha-do-tempo" className="text-xs font-bold text-pink-400 hover:text-pink-300 mt-4 inline-flex items-center gap-1 group">
              Ver memórias <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
