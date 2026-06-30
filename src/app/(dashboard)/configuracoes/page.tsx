'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Sun, Moon, Lock, Heart, Download, Trash2, Save, Palette, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { clearSession } from '@/lib/auth'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from 'next-themes'
import { useAppStore } from '@/store/useAppStore'
import { useRouter } from 'next/navigation'
import type { CoupleConfig } from '@/types'
import toast from 'react-hot-toast'

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { setCoupleConfig } = useAppStore()

  const [config, setConfig] = useState<Partial<CoupleConfig>>({})
  const [loadingConfig, setLoadingConfig] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Load couple_config directly from Supabase — don't rely on store (which can be null)
  useEffect(() => {
    async function loadConfig() {
      setLoadingData(true)
      const { data } = await supabase.from('couple_config').select('*').limit(1).single()
      if (data) {
        setConfig(data as CoupleConfig)
        setCoupleConfig(data as CoupleConfig)
      }
      setLoadingData(false)
    }
    loadConfig()
  }, [])

  async function handleSaveConfig() {
    setLoadingConfig(true)

    const payload = {
      nome_casal: config.nome_casal,
      frase_personalizada: config.frase_personalizada,
      data_inicio_namoro: config.data_inicio_namoro || null,
      data_casamento: config.data_casamento || null,
    }

    let error: { message: string } | null = null

    if (config.id) {
      // UPDATE existing row
      const result = await supabase.from('couple_config').update(payload).eq('id', config.id)
      error = result.error
    } else {
      // INSERT first row
      const result = await supabase.from('couple_config').insert(payload).select().single()
      error = result.error
      if (!error && result.data) {
        setConfig(result.data as CoupleConfig)
        setCoupleConfig(result.data as CoupleConfig)
      }
    }

    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`)
      setLoadingConfig(false)
      return
    }

    // Refresh from DB
    const { data: updated } = await supabase.from('couple_config').select('*').limit(1).single()
    if (updated) {
      setConfig(updated as CoupleConfig)
      setCoupleConfig(updated as CoupleConfig)
    }

    toast.success('Configurações salvas!')
    setLoadingConfig(false)
  }

  async function handleExport() {
    try {
      const [
        { data: memories }, { data: photos }, { data: videos },
        { data: travels }, { data: places }, { data: specials },
        { data: playlist }, { data: letters }, { data: goals },
      ] = await Promise.all([
        supabase.from('memories').select('*'),
        supabase.from('photos').select('*'),
        supabase.from('videos').select('*'),
        supabase.from('travels').select('*'),
        supabase.from('places').select('*'),
        supabase.from('special_dates').select('*'),
        supabase.from('playlist').select('*'),
        supabase.from('letters').select('*'),
        supabase.from('goals').select('*'),
      ])

      const backup = { exportedAt: new Date().toISOString(), memories, photos, videos, travels, places, specials, playlist, letters, goals }
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `nosso-album-backup-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Backup exportado!')
    } catch {
      toast.error('Erro ao exportar')
    }
  }

  function handleLogout() {
    clearSession()
    router.push('/')
    toast.success('Até logo! 👋')
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Configurações" />

      <div className="flex-1 p-4 lg:p-6 max-w-2xl mx-auto w-full space-y-5">
        {/* Casal config */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" /> Nosso Casal
          </h3>
          {loadingData ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-11 rounded-xl" />)}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Nome do casal</label>
                <Input
                  value={config.nome_casal ?? ''}
                  onChange={e => setConfig(p => ({ ...p, nome_casal: e.target.value }))}
                  placeholder="Ex: Wagner & Débora"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Frase personalizada</label>
                <Input
                  value={config.frase_personalizada ?? ''}
                  onChange={e => setConfig(p => ({ ...p, frase_personalizada: e.target.value }))}
                  placeholder="A frase do casal..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Início do namoro</label>
                  <Input
                    type="date"
                    value={config.data_inicio_namoro ?? ''}
                    onChange={e => setConfig(p => ({ ...p, data_inicio_namoro: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Data do casamento</label>
                  <Input
                    type="date"
                    value={config.data_casamento ?? ''}
                    onChange={e => setConfig(p => ({ ...p, data_casamento: e.target.value }))}
                  />
                </div>
              </div>
              <Button variant="gradient" size="sm" onClick={handleSaveConfig} loading={loadingConfig}>
                <Save className="w-4 h-4" /> Salvar configurações
              </Button>
            </div>
          )}
        </motion.div>

        {/* Theme */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Palette className="w-4 h-4 text-purple-400" /> Aparência
          </h3>
          <div className="flex gap-3">
            <button
              onClick={() => setTheme('dark')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${theme === 'dark' ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-rose-400' : 'glass hover:bg-white/5'}`}
            >
              <Moon className="w-4 h-4" /> Escuro
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${theme === 'light' ? 'bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/30 text-rose-400' : 'glass hover:bg-white/5'}`}
            >
              <Sun className="w-4 h-4" /> Claro
            </button>
          </div>
        </motion.div>

        {/* Password info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Lock className="w-4 h-4 text-blue-400" /> Senha de Acesso
          </h3>
          <div className="flex items-start gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-300 font-medium">Senha gerenciada internamente</p>
              <p className="text-xs text-muted-foreground mt-1">
                A senha de acesso é: <strong className="text-foreground">cor favorita de ambos</strong><br />
                Exemplo: <code className="bg-white/10 px-1 rounded">roxo&vermelho</code>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Backup */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Download className="w-4 h-4 text-emerald-400" /> Backup
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Exporte todos os dados em formato JSON para guardar.
          </p>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" /> Exportar Dados
          </Button>
        </motion.div>

        {/* Logout */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5 border-red-500/20">
          <h3 className="font-semibold flex items-center gap-2 mb-4 text-red-400">
            <Trash2 className="w-4 h-4" /> Sair da Conta
          </h3>
          {!showDeleteConfirm ? (
            <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="w-4 h-4" /> Desconectar
            </Button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Tem certeza? Você precisará fazer login novamente.</p>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>Cancelar</Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>Confirmar saída</Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
