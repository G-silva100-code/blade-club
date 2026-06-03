import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/lib/constants'
import { CalendarClock, MapPin } from 'lucide-react'
import type { Booking, Profile } from '@/types'

interface BookingRow extends Booking {
  clients: { profiles: Pick<Profile, 'full_name' | 'avatar_url'> }
  barber_services: { name: string; service_type: string }
}

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
  pending:  'warning',
  accepted: 'success',
  rejected: 'danger',
  completed:'default',
  cancelled:'danger',
}

export default async function SolicitacoesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const result = await supabase
    .from('bookings')
    .select('*, clients(id, profiles(full_name, avatar_url)), barber_services(name, service_type)')
    .eq('barber_id', user!.id)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })

  const bookings = (result.data as BookingRow[] | null) ?? []
  const pending  = bookings.filter(b => b.status === 'pending')
  const accepted = bookings.filter(b => b.status === 'accepted')

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Solicitações</h1>
        <p className="text-gray-500 mt-1">Gerencie os pedidos de agendamento</p>
      </div>

      {/* Pendentes */}
      <section>
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          Aguardando resposta
          {pending.length > 0 && (
            <Badge variant="warning">{pending.length}</Badge>
          )}
        </h2>
        {pending.length === 0 ? (
          <Card>
            <CardBody className="text-center text-gray-400 py-8">
              <CalendarClock className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma solicitação pendente.</p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {pending.map(b => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      {/* Aceitos */}
      {accepted.length > 0 && (
        <section>
          <h2 className="font-semibold text-gray-700 mb-3">Confirmados</h2>
          <div className="space-y-3">
            {accepted.map(b => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function BookingCard({ booking: b }: { booking: BookingRow }) {
  const client  = b.clients.profiles
  const service = b.barber_services

  return (
    <Link href={`/barbeiro/solicitacoes/${b.id}`} className="block">
      <div className={`bg-white rounded-2xl ring-1 p-4 hover:shadow-md transition-shadow ${
        b.status === 'pending' ? 'ring-amber-200' : 'ring-gray-100'
      }`}>
        <div className="flex items-start gap-3">
          <Avatar src={client.avatar_url} name={client.full_name} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-gray-900 truncate">{client.full_name}</p>
              <Badge variant={statusVariant[b.status] ?? 'default'}>
                {BOOKING_STATUS_LABELS[b.status]}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{service.name}</p>
            {b.scheduled_at && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400">
                <CalendarClock className="h-3 w-3" />
                {formatDate(b.scheduled_at)}
              </div>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{b.address}</span>
            </div>
          </div>
          <p className="text-sm font-bold text-gray-900 shrink-0">{formatCurrency(b.total_amount)}</p>
        </div>
      </div>
    </Link>
  )
}
