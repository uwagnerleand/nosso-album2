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
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-md"
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
          'glass border-r border-pink-500/20 shadow-xl shadow-purple-950/20',
          'overflow-hidden',
          !sidebarOpen && 'lg:w-[72px]',
          sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
        style={{ translateX: undefined }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-pink-500/20 shrink-0">
          <AnimatePresence mode="wait">
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-pink-500/30">
                  <Heart className="w-5 h-5 text-white fill-white animate-pulse" />
                </div>
                <span className="font-bold text-lg gradient-text whitespace-nowrap tracking-wide">
                  Nosso Álbum
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {!sidebarOpen && (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600 flex items-center justify-center mx-auto shadow-md shadow-pink-500/30">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className={cn(
              'hidden lg:flex items-center justify-center w-6 h-6 rounded-full',
              'glass hover:bg-pink-500/20 transition-colors text-muted-foreground hover:text-pink-400',
              !sidebarOpen && 'absolute -right-3 top-6 w-6 h-6 bg-background border border-pink-500/30 shadow-md'
            )}
          >
            {sidebarOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>

          {/* Mobile close */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-muted-foreground hover:text-pink-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
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
                      ? 'bg-gradient-to-r from-pink-500/20 via-fuchsia-500/15 to-purple-600/20 text-pink-400 border border-pink-500/30 shadow-sm shadow-pink-500/10'
                      : 'text-muted-foreground hover:text-pink-300 hover:bg-pink-500/10'
                  )}
                  title={!sidebarOpen ? label : undefined}
                >
                  <Icon className={cn('w-5 h-5 shrink-0 transition-colors', active ? 'text-pink-400' : 'group-hover:text-pink-400')} />
                  <AnimatePresence mode="wait">
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={cn("text-sm whitespace-nowrap", active ? "font-bold text-pink-300" : "font-medium")}
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
        <div className="border-t border-pink-500/20 p-2.5 space-y-1 shrink-0 bg-background/30 backdrop-blur-md">
          {bottomItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: sidebarOpen ? 4 : 0 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 cursor-pointer',
                    active
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-600/20 text-pink-400 border border-pink-500/30'
                      : 'text-muted-foreground hover:text-pink-300 hover:bg-pink-500/10'
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
          <div className="pt-2 border-t border-pink-500/20 mt-2">
            {sidebarOpen ? (
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-pink-500/5 border border-pink-500/10">
                <Avatar className="w-8 h-8 shrink-0 ring-2 ring-pink-500/30">
                  <AvatarImage src={user?.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500 to-purple-600 text-white font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">{user?.nome ?? user?.email}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 hover:bg-destructive/10 rounded-lg"
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full px-3 py-2.5 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
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
