'use client'

import { Menu, Sun, Moon, Bell, Search } from 'lucide-react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  const { toggleSidebar, sidebarOpen } = useAppStore()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between h-16 px-4 lg:px-6 border-b border-border/50 glass">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <motion.h1
            key={title}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-semibold leading-none"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Button variant="ghost" size="icon-sm" aria-label="Notificações">
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
