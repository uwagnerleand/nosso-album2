'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { Profile, CoupleConfig } from '@/types'

interface DashboardInitProps {
  profile: Profile | null
  coupleConfig: CoupleConfig | null
  children: React.ReactNode
}

export function DashboardInit({ profile, coupleConfig, children }: DashboardInitProps) {
  const { user, setUser, setCoupleConfig, sidebarOpen } = useAppStore()

  useEffect(() => {
    // Only set initial user if store doesn't have one yet (or if current is the minimal localProfile)
    // This prevents overwriting a full profile that was fetched from Supabase and persisted
    if (!user || !user.nome) {
      setUser(profile)
    }
    if (!useAppStore.getState().coupleConfig) {
      setCoupleConfig(coupleConfig)
    }
  }, [profile, coupleConfig, setUser, setCoupleConfig, user])

  return (
    <div
      className="contents"
      style={{
        '--sidebar-width': sidebarOpen ? '256px' : '72px',
      } as React.CSSProperties}
    >
      {children}
    </div>
  )
}
