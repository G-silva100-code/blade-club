'use client'

import { useState } from 'react'
import { Loader2, MapPin, Calendar, Scissors, User, Info } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { BarberService, TimeSlot } from '@/types'

interface Props {
  barberName:   string
  barberRating: number
  service:      BarberService
  address:      string
  distanceKm:   number
  travelFee:    number
  slot:         TimeSlot
  onConfirm:    () => Promise<void>
  onBack:       () => void
}

export function StepConfirm({
  barberName, barberRating,
  service, address, distanceKm, travelFee, slot,
  onConfirm, onBack,
}: Props) {
  const [loading, setLoading] = useState(false)

  const serviceTotal = service.price
  const total        = serviceTotal + travelFee

  const formattedSlot = new Date(slot.startISO).toLocaleString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit',
  })

  async function handleConfirm() {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Confirme seu agendamento</h2>
        <p className="text-sm text-gray-500">Revise os detalhes antes de solicitar</p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 divide-y divide-gray-100">
        <div className="flex items-center gap-3 p-4">
          <User className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Barbeiro</p>
            <p className="font-semibold text-gray-900">{barberName}</p>
            <p className="text-xs text-gray-500">★ {barberRating.toFixed(1)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Scissors className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Serviço</p>
            <p className="font-semibold text-gray-900">{service.name}</p>
            <p className="text-xs text-gray-500">~{service.duration_minutes} min</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Endereço</p>
            <p className="font-semibold text-gray-900 text-sm">{address}</p>
            <p className="text-xs text-gray-500">{distanceKm.toFixed(1)} km do barbeiro</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4">
          <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Data e horário</p>
            <p className="font-semibold text-gray-900 capitalize">{formattedSlot}</p>
          </div>
        </div>
      </div>

      {/* Breakdown financeiro */}
      <div className="rounded-2xl border border-gray-100 p-5 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{service.name}</span>
          <span>{formatCurrency(serviceTotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Deslocamento ({distanceKm.toFixed(1)} km)</span>
          <span>{travelFee === 0 ? <span className="text-green-600">Grátis</span> : formatCurrency(travelFee)}</span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-blue-50 px-4 py-3 text-xs text-blue-700">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        Pagamento realizado presencialmente no dia do atendimento via cartão ou Pix.
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 rounded-full bg-amber-500 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Solicitar agendamento
        </button>
      </div>
    </div>
  )
}
