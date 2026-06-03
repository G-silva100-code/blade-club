'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { DAY_LABELS } from '@/types'
import type { BarberAvailability } from '@/types'

const ORDERED_DAYS = [1, 2, 3, 4, 5, 6, 0] // Seg→Dom

interface DayState {
  day_of_week: number
  active:      boolean
  start_time:  string
  end_time:    string
}

export function AvailabilityForm() {
  const [days, setDays]       = useState<DayState[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    fetch('/api/barbeiro/availability')
      .then(r => r.json())
      .then((data: BarberAvailability[]) => {
        const map = Object.fromEntries(data.map(d => [d.day_of_week, d]))
        setDays(
          ORDERED_DAYS.map(dow => ({
            day_of_week: dow,
            active:      map[dow]?.active     ?? false,
            start_time:  map[dow]?.start_time ?? '08:00',
            end_time:    map[dow]?.end_time   ?? '18:00',
          }))
        )
        setLoading(false)
      })
  }, [])

  function update(dow: number, field: keyof DayState, value: string | boolean) {
    setDays(prev =>
      prev.map(d => d.day_of_week === dow ? { ...d, [field]: value } : d)
    )
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/barbeiro/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(days),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blade-muted py-8">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {days.map(d => (
        <div
          key={d.day_of_week}
          className={`rounded-xl border p-4 transition-colors ${
            d.active ? 'border-gold bg-blade-card' : 'border-blade-border bg-blade-bg'
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            {/* Toggle */}
            <button
              type="button"
              onClick={() => update(d.day_of_week, 'active', !d.active)}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                d.active ? 'bg-gold' : 'bg-blade-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  d.active ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>

            <span className={`w-36 text-sm font-medium ${d.active ? 'text-blade-text' : 'text-blade-muted'}`}>
              {DAY_LABELS[d.day_of_week]}
            </span>

            {d.active && (
              <div className="flex items-center gap-2 ml-auto">
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-blade-muted uppercase tracking-wider">Início</label>
                  <input
                    type="time"
                    value={d.start_time.slice(0, 5)}
                    onChange={e => update(d.day_of_week, 'start_time', e.target.value)}
                    className="rounded-lg border border-blade-border bg-blade-bg px-2.5 py-1.5 text-sm text-blade-text focus:outline-none focus:border-gold"
                  />
                </div>
                <span className="text-blade-muted mt-4">até</span>
                <div className="flex flex-col gap-0.5">
                  <label className="text-[10px] text-blade-muted uppercase tracking-wider">Fim</label>
                  <input
                    type="time"
                    value={d.end_time.slice(0, 5)}
                    onChange={e => update(d.day_of_week, 'end_time', e.target.value)}
                    className="rounded-lg border border-blade-border bg-blade-bg px-2.5 py-1.5 text-sm text-blade-text focus:outline-none focus:border-gold"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="pt-2 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-blade-bg hover:bg-gold-light disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Salvar disponibilidade
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-400">
            <Check className="h-4 w-4" /> Salvo!
          </span>
        )}
      </div>
    </div>
  )
}
