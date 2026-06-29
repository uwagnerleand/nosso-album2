'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Heart, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-rose-950/20 to-purple-950/30" />
      <div className="absolute inset-0 bg-radial-gradient" />

      {/* Floating hearts */}
      {floatingHearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute pointer-events-none text-rose-500/20"
          style={{ left: `${heart.left}%`, bottom: '-20px', fontSize: heart.size }}
          animate={{ y: [0, -1100] }}
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
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Login card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-card p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 mb-4 shadow-lg shadow-rose-500/30"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Heart className="w-8 h-8 text-white fill-white" />
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text mb-1">Nosso Álbum</h1>
            <p className="text-muted-foreground text-sm">
              Bem-vindo de volta, amor ❤️
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground/80">Senha</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                iconRight={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                autoComplete="current-password"
                required
              />
            </div>

            <p className="text-xs text-muted-foreground/70 text-center leading-relaxed">
              Dica: Cor Favorita de Ambos(ela)&(ele). Exemplo :preto&branco
            </p>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-border w-4 h-4 accent-rose-500"
                />
                <span className="text-sm text-muted-foreground">Lembrar-me</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              loading={loading}
            >
              {!loading && <LogIn className="w-4 h-4" />}
              Entrar
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Acesso exclusivo para o nosso casal 💑
          </p>
        </div>
      </motion.div>
    </div>
  )
}