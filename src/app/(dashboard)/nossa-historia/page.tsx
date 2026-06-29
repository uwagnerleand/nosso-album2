'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Save, Eye, EyeOff, BookOpen, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { Button } from '@/components/ui/button'
import toast from 'react-hot-toast'

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-6 mb-2 gradient-text">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-3 gradient-text">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4 gradient-text">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-rose-400">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-purple-300">$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-rose-500 pl-4 py-1 my-4 text-muted-foreground italic bg-white/5 rounded-r-xl">$1</blockquote>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-foreground/80">')
    .replace(/\n/g, '<br />')
}

export default function NossaHistoriaPage() {
  const supabase = createClient()
  const [historia, setHistoria] = useState('')
  const [draft, setDraft] = useState('')
  const [editing, setEditing] = useState(false)
  const [preview, setPreview] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configId, setConfigId] = useState<string | null>(null)

  useEffect(() => { loadHistoria() }, [])

  async function loadHistoria() {
    setLoading(true)
    const { data } = await supabase
      .from('couple_config')
      .select('id, historia')
      .single()
    if (data) {
      setConfigId(data.id)
      setHistoria((data as any).historia ?? '')
    }
    setLoading(false)
  }

  function startEdit() {
    setDraft(historia)
    setEditing(true)
    setPreview(false)
  }

  function cancelEdit() {
    setDraft('')
    setEditing(false)
    setPreview(false)
  }

  async function saveHistoria() {
    if (!configId) return
    setSaving(true)
    const { error } = await supabase
      .from('couple_config')
      .update({ historia: draft } as any)
      .eq('id', configId)
    if (error) {
      toast.error('Erro ao salvar história')
    } else {
      setHistoria(draft)
      setEditing(false)
      setPreview(false)
      toast.success('História salva com sucesso! 💕')
    }
    setSaving(false)
  }

  const wordCount = (editing ? draft : historia).split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col flex-1">
      <Header title="Nossa História" subtitle="A história do nosso amor" />

      <div className="flex-1 p-4 lg:p-6 max-w-4xl mx-auto w-full space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-purple-500/10" />
          <div className="relative">
            <div className="text-5xl mb-3">📖</div>
            <h2 className="text-2xl font-bold gradient-text mb-2">Nossa História de Amor</h2>
            <p className="text-muted-foreground text-sm">
              Escreva aqui a história de vocês, com markdown para formatar
            </p>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>{wordCount} palavras</span>
              <span>·</span>
              <span>Suporte a Markdown</span>
            </div>
          </div>
        </motion.div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {!editing ? (
            <Button variant="gradient" size="sm" onClick={startEdit}>
              <Edit2 className="w-4 h-4" />
              Editar História
            </Button>
          ) : (
            <>
              <Button variant="gradient" size="sm" onClick={saveHistoria} disabled={saving}>
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreview(!preview)}
              >
                {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {preview ? 'Editar' : 'Visualizar'}
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelEdit}>
                <X className="w-4 h-4" />
                Cancelar
              </Button>
            </>
          )}

          {!editing && historia && (
            <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
              {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {preview ? 'Ocultar' : 'Visualizar'}
            </Button>
          )}
        </div>

        {/* Markdown guide */}
        <AnimatePresence>
          {editing && !preview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-xl p-3 text-xs text-muted-foreground flex flex-wrap gap-3"
            >
              <span><code className="bg-white/10 px-1 rounded"># Título</code></span>
              <span><code className="bg-white/10 px-1 rounded">## Subtítulo</code></span>
              <span><code className="bg-white/10 px-1 rounded">**negrito**</code></span>
              <span><code className="bg-white/10 px-1 rounded">*itálico*</code></span>
              <span><code className="bg-white/10 px-1 rounded">{'>'}  citação</code></span>
              <span><code className="bg-white/10 px-1 rounded">- item</code></span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor / Preview */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="glass-card p-8 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton h-4 rounded" style={{ width: `${60 + (i % 3) * 15}%` }} />
              ))}
            </div>
          ) : editing && !preview ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-1 rounded-2xl"
            >
              <textarea
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder={`# Começo de Tudo\n\nEscreva aqui como vocês se conheceram...\n\n## O Primeiro Encontro\n\nDescreva aquele momento especial...\n\n> "Às vezes o amor simplesmente acontece."\n\n## Nossos Momentos\n\n- Nossa primeira viagem juntos\n- O primeiro 'eu te amo'`}
                className="w-full h-[60vh] bg-transparent resize-none p-6 text-sm leading-relaxed focus:outline-none font-mono placeholder:text-muted-foreground/40"
              />
            </motion.div>
          ) : (historia || draft) ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 prose max-w-none"
            >
              <div
                className="text-base leading-loose"
                dangerouslySetInnerHTML={{
                  __html: `<p class="mb-4 leading-relaxed text-foreground/80">${renderMarkdown(editing ? draft : historia)}</p>`
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <BookOpen className="w-16 h-16 text-rose-500/40 mb-4" />
              <p className="text-lg font-medium">Nenhuma história ainda</p>
              <p className="text-muted-foreground text-sm mt-1">
                Clique em "Editar História" para começar a escrever
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
