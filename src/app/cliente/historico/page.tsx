import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody } from '@/components/ui/Card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/lib/constants'
import { History } from 'lucide-react'

export default async function HistoricoPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawBookings } = await supabase
    .from('bookings')
    .select('id, status, scheduled_at, total_amount, barber_services(name)')
    .eq('client_id', user.id)
    .in('status', ['completed', 'cancelled', 'no_show_client', 'no_show_barber', 'rejected'])
    .order('created_at', { ascending: false })

  const bookings = (rawBookings ?? []) as unknown as Array<{
    id: string
    status: string
    scheduled_at: string | null
    total_amount: number
    barber_services: { name: string }
  }>

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Histórico</h1>

      {bookings.length === 0 ? (
        <Card>
          <CardBody className="text-center py-10 text-gray-400">
            <History className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum atendimento no histórico ainda.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-2xl ring-1 ring-gray-100 p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{b.barber_services.name}</p>
                {b.scheduled_at && (
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(b.scheduled_at)}</p>
                )}
              </div>
              <div className="text-right shrink-0 space-y-1.5">
                <Badge variant={b.status === 'completed' ? 'success' : 'danger'}>
                  {BOOKING_STATUS_LABELS[b.status]}
                </Badge>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(b.total_amount)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
