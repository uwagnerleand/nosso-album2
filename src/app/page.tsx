'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Heart, Sparkles, Camera, Clock, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden dark">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-rose-950/30 to-purple-950/40" />
      <div className="absolute inset-0 bg-radial-gradient" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/6 w-72 h-72 rounded-full bg-purple-500/10 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Floating hearts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-rose-400/20 select-none pointer-events-none"
          style={{
            left: `${10 + i * 11}%`,
            fontSize: `${16 + (i % 3) * 8}px`,
          }}
          animate={{
            y: [-20, -80, -20],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.7,
            ease: 'easeInOut',
          }}
        >
          ❤️
        </motion.div>
      ))}

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="flex justify-center mb-6"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center shadow-2xl shadow-rose-500/30">
              <Heart className="w-12 h-12 text-white fill-white" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
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
          className="text-5xl sm:text-7xl font-bold mb-4"
        >
          <span className="gradient-text">Nosso Álbum</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg sm:text-xl text-muted-foreground mb-8 leading-relaxed"
        >
          Cada memória é um capítulo da nossa história.
          <br />
          <span className="text-rose-400">Um álbum digital feito com amor, para vocês.</span>
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {[
            { icon: Camera, label: 'Galeria de Fotos' },
            { icon: Clock, label: 'Linha do Tempo' },
            { icon: MapPin, label: 'Mapa de Memórias' },
            { icon: Heart, label: 'Momentos Favoritos' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-foreground/80"
            >
              <Icon className="w-4 h-4 text-rose-400" />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/login">
            <Button variant="gradient" size="xl" className="min-w-40 shadow-2xl shadow-rose-500/20">
              <Heart className="w-5 h-5" />
              Entrar no Álbum
            </Button>
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-muted-foreground mt-8"
        >
          Acesso exclusivo para o nosso casal 💑
        </motion.p>
      </div>
    </div>
  )
}
