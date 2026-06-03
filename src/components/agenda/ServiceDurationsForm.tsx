'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2, Clock } from 'lucide-react'
import { SERVICE_LABELS } from '@/lib/constants'
import { DEFAULT_DURATIONS } from '@/types'
import type { ServiceType, BarberServiceDuration } from '@/types'

const SERVICE_TYPES: ServiceType[] = ['haircut', 'beard', 'combo', 'treatment']

interface DurationState {
  service_type:     ServiceType
  duration_minutes: number
}

export function ServiceDurationsForm() {
  const [durations, setDurations] = useState<DurationState[]>(
    SERVICE_TYPES.map(st => ({ service_type: st, duration_minutes: DEFAULT_DURATIONS[st] }))
  )
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  useEffect(() => {
    fetch('/api/barbeiro/service-durations')
      .then(r => r.json())
      .then((data: BarberServiceDuration[]) => {
        if (Array.isArray(data)) {
          setDurations(
            SERVICE_TYPES.map(st => ({
              service_type:     st,
              duration_minutes: data.find(d => d.service_type === st)?.duration_minutes ?? DEFAULT_DURATIONS[st],
            }))
          )
        }
        setLoading(false)
      })
  }, [])

  function setMinutes(serviceType: ServiceType, value: number) {
    setDurations(prev =>
      prev.map(d => d.service_type === serviceType ? { ...d, duration_minutes: value } : d)
    )
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/barbeiro/service-durations', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(durations),
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
    <div className="space-y-4">
      <p className="text-sm text-blade-muted">
        Informe quanto tempo cada serviço leva. Usado para calcular os slots disponíveis de forma precisa.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {durations.map(d => (
          <div key={d.service_type} className="rounded-xl border border-blade-border bg-blade-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-gold" />
              <span className="text-sm font-semibold text-blade-text">
                {SERVICE_LABELS[d.service_type]}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={240}
                step={5}
                value={d.duration_minutes}
                onChange={e => setMinutes(d.service_type, Number(e.target.value))}
                className="w-20 rounded-lg border border-blade-border bg-blade-bg px-3 py-2 text-sm text-blade-text text-right focus:outline-none focus:border-gold"
              />
              <span className="text-sm text-blade-muted">minutos</span>

              <div className="ml-auto flex gap-1">
                {[30, 45, 60, 90].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setMinutes(d.service_type, v)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                      d.duration_minutes === v
                        ? 'bg-gold text-blade-bg'
                        : 'border border-blade-border text-blade-muted hover:border-gold hover:text-gold'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-blade-bg hover:bg-gold-light disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Salvar durações
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
