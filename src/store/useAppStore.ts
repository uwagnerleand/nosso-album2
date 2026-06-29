import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, CoupleConfig } from '@/types'

interface AppState {
  user: Profile | null
  coupleConfig: CoupleConfig | null
  sidebarOpen: boolean
  theme: 'dark' | 'light'
  setUser: (user: Profile | null) => void
  setCoupleConfig: (config: CoupleConfig | null) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      coupleConfig: null,
      sidebarOpen: true,
      theme: 'dark',
      setUser: (user) => set({ user }),
      setCoupleConfig: (coupleConfig) => set({ coupleConfig }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'nosso-album-store',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
)
