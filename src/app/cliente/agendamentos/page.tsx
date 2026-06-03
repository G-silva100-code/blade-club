import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/lib/constants'
import { CalendarClock, Plus } from 'lucide-react'
import type { Booking, Profile, BarberService } from '@/types'

interface BookingRow extends Booking {
  barbers: { profiles: Pick<Profile, 'full_name' | 'avatar_url'> }
  barber_services: Pick<BarberService, 'name'>
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending:        'warning',
  accepted:       'success',
  rejected:       'danger',
  completed:      'default',
  cancelled:      'danger',
  no_show_client: 'danger',
  no_show_barber: 'danger',
}

export default async function AgendamentosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('bookings')
    .select('*, barbers(id, profiles(full_name, avatar_url)), barber_services(name)')
    .eq('client_id', user!.id)
    .order('created_at', { ascending: false })

  const bookings = (result.data as BookingRow[] | null) ?? []
  const active   = bookings.filter(b => ['pending', 'accepted'].includes(b.status))
  const history  = bookings.filter(b => !['pending', 'accepted'].includes(b.status))

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus agendamentos</h1>
          <p className="text-gray-500 mt-1">Acompanhe suas solicitações e histórico</p>
        </div>
        <Link
          href="/buscar"
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> Novo agendamento
        </Link>
      </div>

      {/* Ativos */}
      <section>
        <h2 className="font-semibold text-gray-700 mb-3">Em andamento</h2>
        {active.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10 text-gray-400">
              <CalendarClock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum agendamento ativo.</p>
              <Link href="/buscar" className="mt-3 inline-block text-amber-600 text-sm font-medium hover:underline">
                Encontrar um barbeiro
              </Link>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {active.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        )}
      </section>

      {/* Histórico */}
      {history.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-700 mb-3">Histórico</h2>
          <div className="space-y-3">
            {history.map(b => <BookingCard key={b.id} booking={b} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function BookingCard({ booking: b }: { booking: BookingRow }) {
  const barber  = b.barbers.profiles
  const service = b.barber_services

  return (
    <div className="bg-white rounded-2xl ring-1 ring-gray-100 p-4 flex items-center gap-4">
      <Avatar src={barber.avatar_url} name={barber.full_name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{barber.full_name}</p>
        <p className="text-sm text-gray-500">{service.name}</p>
        {b.scheduled_at && (
          <p className="text-xs text-gray-400 mt-0.5">{formatDate(b.scheduled_at)}</p>
        )}
      </div>
      <div className="text-right shrink-0 space-y-1.5">
        <Badge variant={statusVariant[b.status] ?? 'default'}>
          {BOOKING_STATUS_LABELS[b.status]}
        </Badge>
        <p className="text-sm font-bold text-gray-900">{formatCurrency(b.total_amount)}</p>
      </div>
    </div>
  )
}
