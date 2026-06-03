import Link from 'next/link'
import { CalendarDays, Search, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDate, formatCurrency } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/lib/constants'
import type { Booking, Profile } from '@/types'

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending:        'warning',
  accepted:       'success',
  rejected:       'danger',
  completed:      'default',
  cancelled:      'danger',
  no_show_client: 'danger',
  no_show_barber: 'danger',
}

interface BookingRow extends Booking {
  barbers: { profiles: Pick<Profile, 'full_name' | 'avatar_url'> }
  barber_services: { name: string }
}

export default async function ClienteDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const profileResult = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  const bookingsResult = await supabase
    .from('bookings')
    .select('*, barbers(id, profiles(full_name, avatar_url)), barber_services(name)')
    .eq('client_id', user!.id)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })
    .limit(5)

  const profile = profileResult.data as { full_name: string } | null
  const upcomingBookings = (bookingsResult.data as BookingRow[] | null) ?? []
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Cliente'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Olá, {firstName}!</h1>
          <p className="text-gray-500 mt-1">Bem-vindo de volta</p>
        </div>
        <Link
          href="/barbeiros"
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> Novo agendamento
        </Link>
      </div>

      <Card>
        <CardBody>
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="h-5 w-5 text-brand-500" />
            <h2 className="font-semibold text-gray-900">Próximos agendamentos</h2>
          </div>

          {!upcomingBookings.length ? (
            <div className="text-center py-10 text-gray-400">
              <Search className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Nenhum agendamento ativo.</p>
              <Link href="/barbeiros" className="mt-3 inline-block text-brand-600 text-sm font-medium hover:underline">
                Encontrar um barbeiro
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <Link key={booking.id} href={`/cliente/agendamentos/${booking.id}`} className="block">
                  <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                    <Avatar
                      src={booking.barbers.profiles.avatar_url}
                      name={booking.barbers.profiles.full_name}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{booking.barbers.profiles.full_name}</p>
                      <p className="text-sm text-gray-500">{booking.barber_services.name}</p>
                      {booking.scheduled_at && (
                        <p className="text-sm text-gray-400">{formatDate(booking.scheduled_at)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge variant={statusVariant[booking.status] ?? 'default'}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </Badge>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {formatCurrency(booking.total_amount)}
                      </p>
                    </div>
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
