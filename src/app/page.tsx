'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Sparkles, Camera, Clock, MapPin, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden dark bg-slate-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/40 to-rose-950/30" />
      <div className="absolute inset-0 bg-radial-gradient" />

      {/* Glowing background orbs */}
      <motion.div
        className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl"
        animate={{ scale: [1, 1.25, 1], opacity: [0.35, 0.6, 0.35], x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-20 w-96 h-96 rounded-full bg-purple-600/25 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.6, 0.35, 0.6], y: [0, -30, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-fuchsia-500/15 blur-3xl"
        animate={{ scale: [0.9, 1.15, 0.9] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating hearts */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-400/25 select-none pointer-events-none"
          style={{
            left: `${8 + i * 9.5}%`,
            fontSize: `${18 + (i % 4) * 8}px`,
          }}
          animate={{
            y: [-20, -100, -20],
            opacity: [0, 0.7, 0],
            rotate: [-10, 10, -10],
          }}
          transition={{
            duration: 4.5 + i * 0.4,
            repeat: Infinity,
            delay: i * 0.6,
            ease: 'easeInOut',
          }}
        >
          ❤️
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto py-12">
        {/* Animated Icon Header */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-pink-500/40 glow-magenta rotate-3 hover:rotate-0 transition-transform duration-300">
              <Heart className="w-14 h-14 text-white fill-white animate-pulse" />
            </div>
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-md"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-6xl sm:text-8xl font-black mb-4 tracking-tight"
        >
          <span className="gradient-text drop-shadow-sm">Nosso Álbum</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-xl sm:text-2xl text-purple-200/80 mb-10 leading-relaxed font-light max-w-xl mx-auto"
        >
          Cada memória é um capítulo especial da nossa história.
          <br />
          <span className="font-medium text-pink-400">Um espaço digital feito com amor, para vocês.</span>
        </motion.p>

        {/* Features Chips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {[
            { icon: Camera, label: 'Galeria de Fotos' },
            { icon: Clock, label: 'Linha do Tempo' },
            { icon: MapPin, label: 'Mapa de Memórias' },
            { icon: Star, label: 'Momentos Favoritos' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl glass border border-pink-500/25 bg-pink-500/10 text-sm font-medium text-purple-100 hover:border-pink-500/50 hover:bg-pink-500/20 transition-all duration-200 shadow-sm"
            >
              <Icon className="w-4 h-4 text-pink-400" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <Button variant="gradient" size="xl" className="min-w-48 shadow-2xl shadow-pink-500/30 glow-pink hover:scale-105 transition-all">
              <Heart className="w-5 h-5 fill-white" />
              Entrar no Álbum
            </Button>
          </Link>
        </motion.div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-purple-300/60 mt-10 font-medium"
        >
          Acesso exclusivo para o nosso casal 💑
        </motion.p>
      </div>
    </div>
  )
}
