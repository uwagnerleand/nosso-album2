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
  const { setUser, setCoupleConfig, sidebarOpen } = useAppStore()

  useEffect(() => {
    setUser(profile)
    setCoupleConfig(coupleConfig)
  }, [profile, coupleConfig, setUser, setCoupleConfig])

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
