'use client'

import { useState, useEffect } from 'react'
import { parseISO, differenceInYears, differenceInMonths, differenceInDays } from 'date-fns'

export function useTimeCounter(startDate: string | null) {
  const [time, setTime] = useState({ anos: 0, meses: 0, dias: 0, horas: 0, minutos: 0, segundos: 0, totalDias: 0 })

  useEffect(() => {
    if (!startDate) return

    function update() {
      const inicio = parseISO(startDate!)
      const agora = new Date()
      const anos = differenceInYears(agora, inicio)
      const meses = differenceInMonths(agora, inicio) % 12
      const dias = differenceInDays(agora, inicio) % 30
      const totalDias = differenceInDays(agora, inicio)
      const horas = agora.getHours()
      const minutos = agora.getMinutes()
      const segundos = agora.getSeconds()
      setTime({ anos, meses, dias, horas, minutos, segundos, totalDias })
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [startDate])

  return time
}
