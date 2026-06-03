'use client'

import { SlotPicker } from './SlotPicker'
import type { TimeSlot } from '@/types'

interface Props {
  barberId:    string
  serviceType: string
  clientLat:   number
  clientLng:   number
  selected:    TimeSlot | null
  onSelect:    (slot: TimeSlot) => void
  onNext:      () => void
  onBack:      () => void
}

export function StepSlot({ barberId, serviceType, clientLat, clientLng, selected, onSelect, onNext, onBack }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Escolha o horário</h2>
        <p className="text-sm text-gray-500">
          Horários calculados considerando deslocamento real e agenda do barbeiro
        </p>
      </div>

      <SlotPicker
        barberId={barberId}
        serviceType={serviceType}
        clientLat={clientLat}
        clientLng={clientLng}
        onSelect={onSelect}
        selected={selected?.startISO}
      />

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={!selected}
          className="flex-1 rounded-full bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
