'use client'

import { Menu, Sun, Moon, Bell, Sparkles } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { toggleSidebar } = useAppStore()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-pink-500/20 glass shadow-sm backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-pink-500/10 transition-colors text-muted-foreground hover:text-pink-400"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold leading-none gradient-text"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-400 inline" />
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
          className="hover:bg-pink-500/10 hover:text-pink-400"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-purple-600" />}
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Notificações"
          className="hover:bg-pink-500/10 hover:text-pink-400 relative"
        >
          <Bell className="w-4 h-4 text-pink-400" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full" />
        </Button>
      </div>
    </header>
  )
}
