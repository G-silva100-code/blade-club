'use client'

import { Clock } from 'lucide-react'
import { SERVICE_LABELS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { BarberService } from '@/types'

interface Props {
  services:  BarberService[]
  selected:  BarberService | null
  onSelect:  (s: BarberService) => void
  onNext:    () => void
}

export function StepService({ services, selected, onSelect, onNext }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Qual serviço você quer?</h2>
        <p className="text-sm text-gray-500">Selecione um serviço para ver os horários disponíveis</p>
      </div>

      <div className="space-y-3">
        {services.map(s => (
          <button
            key={s.id}
            onClick={() => onSelect(s)}
            className={`w-full flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
              selected?.id === s.id
                ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500'
                : 'border-gray-100 hover:border-amber-200 hover:bg-amber-50/30'
            }`}
          >
            <div>
              <p className="font-semibold text-gray-900">{s.name}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wider mt-0.5">
                {SERVICE_LABELS[s.service_type]}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-amber-600">{formatCurrency(s.price)}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400 justify-end mt-0.5">
                <Clock className="h-3 w-3" />
                <span>~{s.duration_minutes} min</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!selected}
        className="w-full rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
      >
        Continuar
      </button>
    </div>
  )
}
