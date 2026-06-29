'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { Sidebar } from '@/components/layout/sidebar'
import { DashboardInit } from '@/components/layout/dashboard-init'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const session = getSession()
    if (!session) {
      router.replace('/login')
    }
  }, [router, pathname])

  const session = getSession()

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-rose-950/20 to-purple-950/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  // Cria um perfil mínimo a partir da sessão local
  const localProfile = {
    id: session.email,
    email: session.email,
    nome: session.name,
    apelido: session.name,
    avatar_url: null,
    data_nascimento: null,
    cor_favorita: null,
    comida_favorita: null,
    filme_favorito: null,
    musica_favorita: null,
    sonhos: null,
    curiosidades: null,
    created_at: new Date(session.loggedInAt).toISOString(),
    updated_at: new Date(session.loggedInAt).toISOString(),
  }

  return (
    <DashboardInit profile={localProfile} coupleConfig={null}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col min-h-screen transition-all duration-300 lg:pl-[72px]" id="main-content">
          {children}
        </main>
      </div>
    </DashboardInit>
  )
}