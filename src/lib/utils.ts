import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInDays, differenceInYears, differenceInMonths, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, pattern = 'dd/MM/yyyy') {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, { locale: ptBR })
}

export function formatDateLong(date: string | Date) {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
}

export function calcularTempoJuntos(dataInicio: string) {
  const inicio = parseISO(dataInicio)
  const agora = new Date()

  const anos = differenceInYears(agora, inicio)
  const meses = differenceInMonths(agora, inicio) % 12
  const dias = differenceInDays(agora, inicio) % 30
  const horas = agora.getHours()
  const minutos = agora.getMinutes()
  const segundos = agora.getSeconds()
  const totalDias = differenceInDays(agora, inicio)

  return { anos, meses, dias, horas, minutos, segundos, totalDias }
}

export function calcularProximoAniversario(datas: Array<{ titulo: string; data: string }>) {
  if (!datas.length) return null

  const hoje = new Date()
  const hojeMs = hoje.getTime()

  let proxima: { titulo: string; data: string; diasRestantes: number } | null = null
  let menorDiferenca = Infinity

  for (const { titulo, data } of datas) {
    const d = parseISO(data)
    const proximoAno = new Date(hoje.getFullYear(), d.getMonth(), d.getDate())
    if (proximoAno.getTime() < hojeMs) {
      proximoAno.setFullYear(hoje.getFullYear() + 1)
    }
    const diff = differenceInDays(proximoAno, hoje)
    if (diff < menorDiferenca) {
      menorDiferenca = diff
      proxima = { titulo, data, diasRestantes: diff }
    }
  }

  return proxima
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export const CATEGORIES = [
  { value: 'geral', label: 'Geral', emoji: '💫' },
  { value: 'namoro', label: 'Namoro', emoji: '❤️' },
  { value: 'viagem', label: 'Viagem', emoji: '✈️' },
  { value: 'conquista', label: 'Conquista', emoji: '🏆' },
  { value: 'aniversario', label: 'Aniversário', emoji: '🎂' },
  { value: 'primeiro-beijo', label: 'Primeiro Beijo', emoji: '💋' },
  { value: 'pedido', label: 'Pedido', emoji: '💍' },
  { value: 'casamento', label: 'Casamento', emoji: '💒' },
  { value: 'familia', label: 'Família', emoji: '👨‍👩‍👧' },
  { value: 'amigos', label: 'Amigos', emoji: '👫' },
  { value: 'outro', label: 'Outro', emoji: '📌' },
]
