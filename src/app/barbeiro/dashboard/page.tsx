import { createClient } from '@/lib/supabase/server'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { formatCurrency } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/lib/constants'
import { AlertTriangle, DollarSign, Star, Calendar } from 'lucide-react'
import Link from 'next/link'
import type { Barber, Booking, Profile } from '@/types'

interface PendingBookingRow extends Booking {
  clients: { profiles: Pick<Profile, 'full_name' | 'avatar_url'> }
  barber_services: { name: string }
}

export default async function BarbeiroDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [barberResult, pendingResult, monthResult] = await Promise.all([
    supabase.from('barbers').select('*, profiles(full_name)').eq('id', user!.id).single(),
    supabase
      .from('bookings')
      .select('*, clients(id, profiles(full_name, avatar_url)), barber_services(name)')
      .eq('barber_id', user!.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    supabase
      .from('bookings')
      .select('barber_payout, status')
      .eq('barber_id', user!.id)
      .eq('status', 'completed')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
  ])

  const barber = barberResult.data as (Barber & { profiles: Pick<Profile, 'full_name'> }) | null
  const pendingBookings = (pendingResult.data as PendingBookingRow[] | null) ?? []
  const monthBookings = (monthResult.data as Pick<Booking, 'barber_payout'>[] | null) ?? []

  const monthEarnings = monthBookings.reduce((s, b) => s + b.barber_payout, 0)
  const monthCompleted = monthBookings.length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Olá, {barber?.profiles?.full_name?.split(' ')[0]}!
          </h1>
          {barber?.status === 'pending' && (
            <div className="mt-2 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Seu cadastro está em análise. Você receberá um email quando for aprovado (até 48h).
            </div>
          )}
        </div>
        <div className="text-right">
          <StarRating value={barber?.rating_avg ?? 0} />
          <p className="text-xs text-gray-400 mt-1">{barber?.rating_count} avaliações</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Ganhos este mês</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(monthEarnings)}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Atendimentos concluídos</p>
              <p className="text-xl font-bold text-gray-900">{monthCompleted}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
              <Star className="h-6 w-6 text-brand-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Nota média</p>
              <p className="text-xl font-bold text-gray-900">{(barber?.rating_avg ?? 0).toFixed(1)}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Solicitações pendentes */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">
              Solicitações pendentes
              {pendingBookings.length > 0 && (
                <Badge variant="warning" className="ml-2">{pendingBookings.length}</Badge>
              )}
            </h2>
            <Link href="/barbeiro/solicitacoes" className="text-sm text-brand-600 hover:underline">
              Ver todas
            </Link>
          </div>

          {!pendingBookings.length ? (
            <p className="text-gray-400 text-sm py-4 text-center">Nenhuma solicitação pendente.</p>
          ) : (
            <div className="space-y-3">
              {pendingBookings.slice(0, 3).map((booking) => (
                <Link key={booking.id} href={`/barbeiro/solicitacoes/${booking.id}`} className="block">
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                    <Avatar
                      src={booking.clients.profiles.avatar_url}
                      name={booking.clients.profiles.full_name}
                      size="sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{booking.clients.profiles.full_name}</p>
                      <p className="text-xs text-gray-500">{booking.barber_services.name}</p>
                    </div>
                    <Badge variant="warning">{BOOKING_STATUS_LABELS.pending}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
