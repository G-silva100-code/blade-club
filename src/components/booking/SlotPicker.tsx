'use client'

import { useEffect, useState } from 'react'
import { Loader2, Clock, MapPin, AlertCircle } from 'lucide-react'
import type { TimeSlot } from '@/types'

interface SlotPickerProps {
  barberId:    string
  serviceType: string
  clientLat:   number
  clientLng:   number
  onSelect:    (slot: TimeSlot) => void
  selected?:   string  // startISO
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

function getNext14Days(): Array<{ label: string; date: string; weekday: string }> {
  const days = []
  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const date = d.toISOString().split('T')[0]
    days.push({
      label:   d.getDate().toString(),
      date,
      weekday: WEEK_DAYS[d.getDay()],
    })
  }
  return days
}

export function SlotPicker({ barberId, serviceType, clientLat, clientLng, onSelect, selected }: SlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots]               = useState<TimeSlot[]>([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const days = getNext14Days()

  useEffect(() => {
    if (!selectedDate) return
    setLoading(true)
    setError(null)
    setSlots([])

    const params = new URLSearchParams({
      barber_id:    barberId,
      date:         selectedDate,
      service_type: serviceType,
      lat:          clientLat.toString(),
      lng:          clientLng.toString(),
    })

    fetch(`/api/slots?${params}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSlots(data)
        } else {
          setError(data.error ?? 'Erro ao buscar horários')
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Erro de conexão')
        setLoading(false)
      })
  }, [selectedDate, barberId, serviceType, clientLat, clientLng])

  return (
    <div className="space-y-5">
      {/* Date picker horizontal */}
      <div>
        <p className="text-xs text-blade-muted uppercase tracking-wider mb-3">Escolha a data</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {days.map(d => (
            <button
              key={d.date}
              onClick={() => setSelectedDate(d.date)}
              className={`flex-shrink-0 flex flex-col items-center rounded-xl border px-3 py-2.5 min-w-[52px] transition-colors ${
                selectedDate === d.date
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-blade-border text-blade-muted hover:border-gold'
              }`}
            >
              <span className="text-[10px] uppercase">{d.weekday}</span>
              <span className="text-lg font-bold leading-tight">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slots */}
      {selectedDate && (
        <div>
          <p className="text-xs text-blade-muted uppercase tracking-wider mb-3">
            Horários disponíveis
          </p>

          {loading && (
            <div className="flex items-center gap-2 text-blade-muted py-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando slots com tempo de deslocamento...
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-400 py-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {!loading && !error && slots.length === 0 && (
            <p className="text-blade-muted text-sm py-4">
              Nenhum horário disponível nessa data.
            </p>
          )}

          {!loading && slots.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map(slot => (
                <button
                  key={slot.startISO}
                  onClick={() => onSelect(slot)}
                  className={`flex flex-col items-center rounded-xl border px-2 py-3 transition-colors ${
                    selected === slot.startISO
                      ? 'border-gold bg-gold text-blade-bg'
                      : 'border-blade-border bg-blade-card text-blade-text hover:border-gold'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span className="text-sm font-semibold">{slot.start}</span>
                  </div>
                  {slot.travel_minutes > 0 && (
                    <div className={`flex items-center gap-0.5 mt-1 text-[10px] ${
                      selected === slot.startISO ? 'text-blade-bg/70' : 'text-blade-muted'
                    }`}>
                      <MapPin className="h-2.5 w-2.5" />
                      {slot.travel_minutes} min
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
