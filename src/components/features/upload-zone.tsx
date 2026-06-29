'use client'

import { useCallback, useState } from 'react'
import { useDropzone, type Accept } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Film, Check } from 'lucide-react'
import { cn, formatBytes } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface UploadedFile {
  file: File
  preview: string
  progress: number
  url?: string
  error?: string
  done: boolean
}

interface UploadZoneProps {
  bucket: 'photos' | 'videos'
  folder?: string
  accept?: Accept
  maxFiles?: number
  maxSize?: number
  onUploadComplete?: (urls: string[]) => void
}

export function UploadZone({
  bucket,
  folder = '',
  accept,
  maxFiles = 20,
  maxSize = 50 * 1024 * 1024,
  onUploadComplete,
}: UploadZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()

  const defaultAccept = (bucket === 'photos'
    ? { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif'] }
    : { 'video/*': ['.mp4', '.webm', '.mov', '.avi'] }) as Accept

  const onDrop = useCallback((accepted: File[]) => {
    const newFiles: UploadedFile[] = accepted.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      done: false,
    }))
    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles))
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ?? defaultAccept,
    maxFiles,
    maxSize,
    onDropRejected: (rejected) => {
      rejected.forEach(({ errors }) => {
        errors.forEach(e => toast.error(e.message))
      })
    },
  })

  function removeFile(index: number) {
    setFiles(prev => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  async function uploadAll() {
    if (!files.length) return
    setUploading(true)

    const urls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const f = files[i]
      if (f.done) continue

      const ext = f.file.name.split('.').pop()
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      setFiles(prev => {
        const next = [...prev]
        next[i] = { ...next[i], progress: 30 }
        return next
      })

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, f.file, { cacheControl: '3600', upsert: false })

      if (error) {
        setFiles(prev => {
          const next = [...prev]
          next[i] = { ...next[i], error: error.message, progress: 0 }
          return next
        })
        toast.error(`Erro: ${f.file.name}`)
        continue
      }

      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)

      setFiles(prev => {
        const next = [...prev]
        next[i] = { ...next[i], progress: 100, done: true, url: publicUrl }
        return next
      })

      urls.push(publicUrl)
    }

    setUploading(false)
    if (urls.length > 0) {
      toast.success(`${urls.length} arquivo(s) enviado(s)! ✨`)
      onUploadComplete?.(urls)
    }
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
          isDragActive
            ? 'border-rose-500 bg-rose-500/5 scale-[1.02]'
            : 'border-border hover:border-rose-500/50 hover:bg-rose-500/5'
        )}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={{ scale: isDragActive ? 1.1 : 1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
            isDragActive ? 'bg-rose-500/20' : 'bg-muted'
          )}>
            {bucket === 'photos' ? (
              <ImageIcon className={cn('w-7 h-7', isDragActive ? 'text-rose-400' : 'text-muted-foreground')} />
            ) : (
              <Film className={cn('w-7 h-7', isDragActive ? 'text-rose-400' : 'text-muted-foreground')} />
            )}
          </div>
          <div>
            <p className="font-medium">
              {isDragActive ? 'Solte aqui!' : 'Arraste arquivos ou clique'}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {bucket === 'photos' ? 'JPG, PNG, WebP, GIF' : 'MP4, WebM, MOV'} · máx {formatBytes(maxSize)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* File list */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-3 p-3 rounded-xl glass"
              >
                {bucket === 'photos' ? (
                  <img src={f.preview} className="w-10 h-10 rounded-lg object-cover shrink-0" alt="" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Film className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(f.file.size)}</p>
                  {f.progress > 0 && !f.done && (
                    <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-rose-500 to-purple-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${f.progress}%` }}
                      />
                    </div>
                  )}
                </div>
                {f.done ? (
                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <button
                    onClick={() => removeFile(i)}
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </motion.div>
            ))}

            {files.some(f => !f.done) && (
              <button
                onClick={uploadAll}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-500 text-white text-sm font-medium disabled:opacity-70 hover:opacity-90 transition-opacity"
              >
                {uploading ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Enviando...' : `Enviar ${files.filter(f => !f.done).length} arquivo(s)`}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
