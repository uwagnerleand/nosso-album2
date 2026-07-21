'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Mail, Lock, Eye, EyeOff, LogIn, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { validateCredentials, saveSession } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const floatingHearts = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.random() * 20 + 10,
  left: Math.random() * 100,
  delay: Math.random() * 5,
  duration: Math.random() * 3 + 4,
}))

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    const result = validateCredentials(email, password)
    if (!result.valid) {
      toast.error(result.error!)
      return
    }

    setLoading(true)

    // Salva a sessão localmente
    saveSession(result.session!)
    toast.success('Bem-vindo de volta! ❤️')
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden dark bg-slate-950">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/30 to-pink-950/40" />
      <div className="absolute inset-0 bg-radial-gradient" />

      {/* Floating hearts */}
      {floatingHearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute pointer-events-none text-pink-400/25 select-none"
          style={{ left: `${heart.left}%`, bottom: '-20px', fontSize: heart.size }}
          animate={{ y: [0, -1100], rotate: [-15, 15, -15] }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          ❤️
        </motion.div>
      ))}

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl" />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 border border-pink-500/30 shadow-2xl shadow-purple-950/50 backdrop-blur-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 mb-4 shadow-xl shadow-pink-500/30 glow-pink"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>
            <h1 className="text-3xl font-black gradient-text mb-1">Nosso Álbum</h1>
            <p className="text-purple-200/70 text-sm font-medium flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Bem-vindo de volta, amor ❤️
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/90">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-pink-400" />}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground/90">Senha</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4 text-pink-400" />}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer hover:text-pink-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
                required
              />
            </div>

            <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
              <p className="text-xs text-pink-300/80 leading-relaxed font-medium">
                Dica: Cor Favorita de Ambos (ela)&(ele). Exemplo: <span className="font-semibold text-pink-200">preto&branco</span>
              </p>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-pink-500/30 w-4 h-4 accent-pink-500 cursor-pointer"
                />
                <span className="text-sm text-purple-200/80 group-hover:text-pink-300 transition-colors">Lembrar-me</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full shadow-lg shadow-pink-500/25 glow-pink font-bold"
              loading={loading}
            >
              {!loading && <LogIn className="w-4 h-4" />}
              Entrar
            </Button>
          </form>

          <p className="text-center text-xs text-purple-300/60 mt-6 font-medium">
            Acesso exclusivo para o nosso casal 💑
          </p>
        </div>
      </motion.div>
    </div>
  )
}