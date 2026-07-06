'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, LayoutDashboard, BookOpen, Clock, Images, Video,
  MapPin, Plane, Calendar, Music, Mail, Target, Star,
  CalendarDays, Package, MessageSquare, User, Settings,
  LogOut, ChevronLeft, ChevronRight, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/nossa-historia', label: 'Nossa História', icon: BookOpen },
  { href: '/conheca-seu-parceiro', label: 'Conheça seu Parceiro', icon: Heart },
  { href: '/linha-do-tempo', label: 'Linha do Tempo', icon: Clock },
  { href: '/galeria', label: 'Galeria', icon: Images },
  { href: '/videos', label: 'Vídeos', icon: Video },
  { href: '/lugares', label: 'Lugares', icon: MapPin },
  { href: '/viagens', label: 'Viagens', icon: Plane },
  { href: '/datas-especiais', label: 'Datas Especiais', icon: Calendar },
  { href: '/playlist', label: 'Playlist', icon: Music },
  { href: '/metas', label: 'Metas do Casal', icon: Target },
  { href: '/cartas', label: 'Cartas', icon: Mail },
  { href: '/momentos-favoritos', label: 'Momentos Favoritos', icon: Star },
  { href: '/calendario', label: 'Calendário', icon: CalendarDays },
  { href: '/capsula-do-tempo', label: 'Cápsula do Tempo', icon: Package },
  { href: '/mural', label: 'Mural de Recados', icon: MessageSquare },
]

const bottomItems = [
  { href: '/perfil', label: 'Perfil', icon: User },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar, user } = useAppStore()
  const router = useRouter()

  function handleLogout() {
    // Limpa a sessão local
    document.cookie = 'nosso-album-session=; path=/; max-age=0'
    localStorage.removeItem('nosso-album-session')
    toast.success('Até logo! 👋')
    router.push('/login')
  }

  const initials = user?.nome
    ? user.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 h-full z-40 flex flex-col',
          'glass border-r border-border/50',
          'overflow-hidden',
          !sidebarOpen && 'lg:w-[72px]',
          sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ translateX: undefined }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-bold text-lg gradient-text whitespace-nowrap">Nosso Álbum</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!sidebarOpen && (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-purple-500 flex items-center justify-center mx-auto">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex items-center justify-center w-6 h-6 rounded-full',
              'glass hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground',
              !sidebarOpen && 'absolute -right-3 top-6 w-6 h-6 bg-card border border-border'
            )}
          >
            {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {/* Mobile close */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} onClick={() => typeof window !== 'undefined' && window.innerWidth < 1024 && toggleSidebar()}>
                <motion.div
                  whileHover={{ x: sidebarOpen ? 4 : 0 }}
                  whileTap={{ scale: 0.97 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer group',
                    active
                      ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/10 text-rose-400 border border-rose-500/20'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className={cn('w-5 h-5 shrink-0', active && 'text-rose-400')} />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border/50 p-2 space-y-0.5 shrink-0">
          {bottomItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: sidebarOpen ? 4 : 0 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer',
                    active
                      ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/10 text-rose-400'
                      : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                  )}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
                </motion.div>
              </Link>
            )
          })}

          {/* User + logout */}
          <div className="pt-2 border-t border-border/50 mt-2">
            {sidebarOpen ? (
              <div className="flex items-center gap-2 px-3 py-2">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarImage src={user?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user?.nome ?? user?.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-white/5 transition-all"
                title="Sair"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  )
}
