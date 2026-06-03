import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardBody } from '@/components/ui/Card'
import { Calendar, DollarSign, Star, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Booking } from '@/types'

export default async function BarbeiroDashboardPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userId = session.user.id

  const [bookingsRes, reviewsRes] = await Promise.all([
    supabase
      .from('bookings')
      .select('*')
      .eq('barber_id', userId)
      .order('scheduled_at', { ascending: true }),
    supabase
      .from('reviews')
      .select('rating')
      .eq('reviewed_id', userId),
  ])

  const bookings = (bookingsRes.data as Booking[] | null) ?? []
  const reviews  = reviewsRes.data ?? []

  const now = new Date()
  const upcoming = bookings.filter(
    (b) => b.status === 'accepted' && b.scheduled_at != null && new Date(b.scheduled_at) > now
  )
  const pendingCount   = bookings.filter((b) => b.status === 'pending').length
  const completedCount = bookings.filter((b) => b.status === 'completed').length

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthEarnings = bookings
    .filter((b) => b.status === 'completed' && b.created_at >= monthStart)
    .reduce((s, b) => s + b.barber_payout, 0)

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0

  const kpis = [
    { label: 'Próximos agendados',    value: upcoming.length,           icon: Calendar,   color: 'text-blue-600 bg-blue-50',   fmt: String },
    { label: 'Aguardando resposta',   value: pendingCount,              icon: Clock,      color: 'text-amber-600 bg-amber-50', fmt: String },
    { label: 'Ganhos do mês',         value: monthEarnings,             icon: DollarSign, color: 'text-green-600 bg-green-50', fmt: formatCurrency },
    { label: 'Avaliação média',       value: avgRating,                 icon: Star,       color: 'text-brand-600 bg-brand-50', fmt: (v: number) => v ? `${v.toFixed(1)} ★` : '—' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardBody className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-900">{kpi.fmt(kpi.value as any)}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {upcoming.length > 0 && (
        <Card>
          <CardBody>
            <h2 className="font-semibold text-gray-900 mb-4">Próximos atendimentos</h2>
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((b) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString('pt-BR', {
                        weekday: 'short', day: '2-digit', month: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      }) : '—'}
                    </p>
                    <p className="text-xs text-gray-500">{b.address}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(b.barber_payout)}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {upcoming.length === 0 && completedCount === 0 && (
        <Card>
          <CardBody className="text-center py-10">
            <p className="text-gray-400 text-sm">Nenhum atendimento ainda.</p>
            <p className="text-gray-300 text-xs mt-1">Quando clientes solicitarem, aparecerão aqui.</p>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
