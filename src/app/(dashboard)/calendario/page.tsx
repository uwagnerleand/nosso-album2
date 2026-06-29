'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/layout/header'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, getDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Memory, SpecialDate } from '@/types'

type EventDay = {
  date: Date
  memories: Memory[]
  specials: SpecialDate[]
}

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function CalendarioPage() {
  const supabase = createClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [memories, setMemories] = useState<Memory[]>([])
  const [specials, setSpecials] = useState<SpecialDate[]>([])
  const [selected, setSelected] = useState<EventDay | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: mem }, { data: spec }] = await Promise.all([
        supabase.from('memories').select('*'),
        supabase.from('special_dates').select('*'),
      ])
      setMemories(mem ?? [])
      setSpecials(spec ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPadding = getDay(monthStart)

  function getEventsForDay(day: Date): EventDay {
    const dayStr = format(day, 'yyyy-MM-dd')
    const monthDay = format(day, 'MM-dd')

    const mem = memories.filter(m => m.data === dayStr)
    const spec = specials.filter(s => {
      const sd = parseISO(s.data)
      return format(sd, 'MM-dd') === monthDay
    })

    return { date: day, memories: mem, specials: spec }
  }

  function prevMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1)) }
  function nextMonth() { setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1)) }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Calendário" subtitle="Memórias e datas especiais" />

      <div className="flex-1 p-4 lg:p-6 space-y-4">
        {/* Month nav */}
        <div className="flex items-center justify-between glass-card p-4">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Calendar grid */}
        <div className="glass-card p-4">
          {/* Header */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS_PT.map(d => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {[...Array(startPadding)].map((_, i) => <div key={`pad-${i}`} />)}

            {days.map(day => {
              const events = getEventsForDay(day)
              const hasEvents = events.memories.length > 0 || events.specials.length > 0
              const isToday = isSameDay(day, new Date())

              return (
                <motion.button
                  key={day.toISOString()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => hasEvents ? setSelected(events) : null}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all p-1 ${
                    isToday
                      ? 'bg-gradient-to-br from-rose-500 to-purple-500 text-white font-bold'
                      : hasEvents
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-pointer hover:bg-rose-500/20'
                      : 'hover:bg-white/5 text-foreground'
                  }`}
                >
                  <span className="text-xs sm:text-sm">{format(day, 'd')}</span>
                  {hasEvents && !isToday && (
                    <div className="flex gap-0.5 mt-0.5">
                      {events.memories.length > 0 && <div className="w-1 h-1 rounded-full bg-rose-400" />}
                      {events.specials.length > 0 && <div className="w-1 h-1 rounded-full bg-amber-400" />}
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-rose-400" /> Memórias
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-amber-400" /> Datas Especiais
            </div>
          </div>
        </div>

        {/* Events for selected day */}
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-rose-400" />
              <h3 className="font-semibold">
                {format(selected.date, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
            </div>

            {selected.specials.length > 0 && (
              <div className="space-y-2 mb-3">
                <p className="text-xs font-medium text-amber-400">DATAS ESPECIAIS</p>
                {selected.specials.map(s => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span>{s.emoji}</span>
                    <span className="text-sm font-medium">{s.titulo}</span>
                  </div>
                ))}
              </div>
            )}

            {selected.memories.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-rose-400">MEMÓRIAS</p>
                {selected.memories.map(m => (
                  <div key={m.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <span>{m.emoji}</span>
                    <span className="text-sm font-medium">{m.titulo}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
