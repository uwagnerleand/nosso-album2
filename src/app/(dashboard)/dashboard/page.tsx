'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DashboardClient } from './dashboard-client'

export default function DashboardPage() {
  const [data, setData] = useState<{
    totalFotos: number
    totalVideos: number
    totalLugares: number
    totalViagens: number
    totalMemories: number
    ultimaMemoria: any
    datasEspeciais: any[]
    coupleConfig: any
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()

      const [
        { count: totalFotos },
        { count: totalVideos },
        { count: totalLugares },
        { count: totalViagens },
        { count: totalMemories },
        { data: ultimaMemoria },
        { data: datasEspeciais },
        { data: coupleConfig },
      ] = await Promise.all([
        supabase.from('photos').select('*', { count: 'exact', head: true }),
        supabase.from('videos').select('*', { count: 'exact', head: true }),
        supabase.from('places').select('*', { count: 'exact', head: true }),
        supabase.from('travels').select('*', { count: 'exact', head: true }),
        supabase.from('memories').select('*', { count: 'exact', head: true }),
        supabase.from('memories').select('*').order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('special_dates').select('titulo, data').order('data'),
        supabase.from('couple_config').select('*').single(),
      ])

      setData({
        totalFotos: totalFotos ?? 0,
        totalVideos: totalVideos ?? 0,
        totalLugares: totalLugares ?? 0,
        totalViagens: totalViagens ?? 0,
        totalMemories: totalMemories ?? 0,
        ultimaMemoria: ultimaMemoria ?? null,
        datasEspeciais: datasEspeciais ?? [],
        coupleConfig,
      })
      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
      </div>
    )
  }

  return (
    <DashboardClient
      stats={{
        totalFotos: data!.totalFotos,
        totalVideos: data!.totalVideos,
        totalLugares: data!.totalLugares,
        totalViagens: data!.totalViagens,
        totalMemories: data!.totalMemories,
        ultimaMemoria: data!.ultimaMemoria,
      }}
      datasEspeciais={data!.datasEspeciais}
      coupleConfig={data!.coupleConfig}
    />
  )
}