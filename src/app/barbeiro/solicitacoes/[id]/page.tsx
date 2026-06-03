'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Calendar, Scissors, DollarSign, CheckCircle, X, Clock, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/lib/constants'

interface BookingDetail {
  id:             string
  status:         string
  address:        string
  lat:            number
  lng:            number
  scheduled_at:   string | null
  total_amount:   number
  service_price:  number
  travel_fee:     number
  platform_fee:   number
  barber_payout:  number
  distance_km:    number
  created_at:     string
  barber_services: { name: string; service_type: string; duration_minutes?: number }
  booking_time_suggestions: Array<{ suggested_at: string; proposed_by: string }>
  clients?: { profiles: { full_name: string; avatar_url: string | null } }
}

export default function SolicitacaoDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [booking, setBooking]     = useState<BookingDetail | null>(null)
  const [loading, setLoading]     = useState(true)
  const [actioning, setActioning] = useState(false)
  const [proposeMode, setProposeMode] = useState(false)
  const [proposeTime, setProposeTime] = useState('')

  useEffect(() => {
    fetch(`/api/bookings/${params.id}`)
      .then(r => r.json())
      .then(data => { setBooking(data); setLoading(false) })
  }, [params.id])

  async function action(endpoint: string, body?: object) {
    setActioning(true)
    await fetch(`/api/bookings/${params.id}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
    setActioning(false)
    router.push('/barbeiro/solicitacoes')
    router.refresh()
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-gray-400">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  )
  if (!booking) return <p className="text-gray-400 text-center py-10">Agendamento não encontrado.</p>

  const suggestions = booking.booking_time_suggestions ?? []
  const clientProfile = booking.clients?.profiles

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Solicitação de agendamento</h1>
        <Badge variant={booking.status === 'pending' ? 'warning' : booking.status === 'accepted' ? 'success' : 'danger'}>
          {BOOKING_STATUS_LABELS[booking.status]}
        </Badge>
      </div>

      {/* Cliente */}
      {clientProfile && (
        <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-4 flex items-center gap-3">
          <Avatar src={clientProfile.avatar_url} name={clientProfile.full_name} size="lg" />
          <div>
            <p className="font-semibold text-gray-900">{clientProfile.full_name}</p>
            <p className="text-xs text-gray-400">Cliente</p>
          </div>
        </div>
      )}

      {/* Detalhes */}
      <div className="bg-white rounded-2xl ring-1 ring-gray-100 divide-y divide-gray-50">
        <div className="flex items-start gap-3 p-4">
          <Scissors className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Serviço</p>
            <p className="font-medium text-gray-900">{booking.barber_services.name}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Endereço</p>
            <p className="font-medium text-gray-900 text-sm">{booking.address}</p>
            <p className="text-xs text-gray-400 mt-0.5">{booking.distance_km.toFixed(1)} km de distância</p>
          </div>
        </div>
        {suggestions.length > 0 && (
          <div className="flex items-start gap-3 p-4">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Horário{suggestions.length > 1 ? 's sugeridos' : ' sugerido'}
              </p>
              {suggestions.map((s, i) => (
                <p key={i} className="font-medium text-gray-900 text-sm">{formatDate(s.suggested_at)}</p>
              ))}
            </div>
          </div>
        )}
        {booking.scheduled_at && (
          <div className="flex items-start gap-3 p-4">
            <Clock className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">Horário confirmado</p>
              <p className="font-medium text-gray-900 text-sm">{formatDate(booking.scheduled_at)}</p>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3 p-4">
          <DollarSign className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
          <div className="w-full">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Financeiro</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Valor do serviço</span><span>{formatCurrency(booking.service_price)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Deslocamento</span><span>{formatCurrency(booking.travel_fee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Comissão plataforma</span><span>-{formatCurrency(booking.platform_fee)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1">
                <span>Você recebe</span><span className="text-green-600">{formatCurrency(booking.barber_payout)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      {booking.status === 'pending' && (
        <div className="space-y-3">
          {!proposeMode ? (
            <>
              {/* Aceitar com horário sugerido */}
              {suggestions[0] && (
                <button
                  onClick={() => action('accept', { scheduled_at: suggestions[0].suggested_at })}
                  disabled={actioning}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-green-500 py-3.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Aceitar horário sugerido
                </button>
              )}

              {/* Propor alternativo */}
              <button
                onClick={() => setProposeMode(true)}
                className="w-full rounded-full border-2 border-amber-400 py-3.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
              >
                Propor outro horário
              </button>

              {/* Recusar */}
              <button
                onClick={() => action('reject')}
                disabled={actioning}
                className="w-full flex items-center justify-center gap-2 rounded-full border border-gray-200 py-3 text-sm font-medium text-red-500 hover:bg-red-50 disabled:opacity-60 transition-colors"
              >
                <X className="h-4 w-4" /> Recusar agendamento
              </button>
            </>
          ) : (
            <div className="bg-white rounded-2xl ring-1 ring-amber-200 p-5 space-y-4">
              <p className="font-medium text-gray-900">Propor novo horário</p>
              <input
                type="datetime-local"
                value={proposeTime}
                onChange={e => setProposeTime(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setProposeMode(false)}
                  className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm text-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => action('accept', { scheduled_at: new Date(proposeTime).toISOString() })}
                  disabled={!proposeTime || actioning}
                  className="flex-1 rounded-full bg-amber-500 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  Confirmar proposta
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check-in / Check-out */}
      {booking.status === 'accepted' && (
        <div className="flex gap-3">
          {!booking.scheduled_at && (
            <button
              onClick={() => action('checkin')}
              disabled={actioning}
              className="flex-1 rounded-full bg-blue-500 py-3 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-60"
            >
              Check-in (cheguei)
            </button>
          )}
          <button
            onClick={() => action('checkout')}
            disabled={actioning}
            className="flex-1 rounded-full bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
          >
            Check-out (concluído)
          </button>
        </div>
      )}
    </div>
  )
}
