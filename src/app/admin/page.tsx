import { createClient } from '@/lib/supabase/server'
import { Card, CardBody } from '@/components/ui/Card'
import { Users, CalendarClock, DollarSign, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function AdminPage() {
  const supabase = createClient()

  const [barbeirosRes, bookingsRes, flagsRes] = await Promise.all([
    supabase.from('barbers').select('status'),
    supabase.from('bookings').select('status, barber_payout, created_at'),
    supabase.from('bypass_flags').select('reviewed').eq('reviewed', false),
  ])

  const barbers  = barbeirosRes.data  ?? []
  const bookings = bookingsRes.data   ?? []
  const flags    = flagsRes.data      ?? []

  const pendingBarbers    = barbers.filter((b) => b.status === 'pending').length
  const verifiedBarbers   = barbers.filter((b) => b.status === 'verified').length
  const activeBookings    = bookings.filter((b) => ['pending', 'accepted'].includes(b.status)).length
  const completedBookings = bookings.filter((b) => b.status === 'completed')

  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const monthRevenue = completedBookings
    .filter((b) => (b as any).created_at >= monthStart)
    .reduce((s, b) => s + ((b as any).barber_payout ?? 0) * (1 / 0.7) * 0.3, 0)

  const kpis = [
    { label: 'Barbeiros verificados', value: verifiedBarbers,  icon: Users,          color: 'text-green-600 bg-green-50' },
    { label: 'Pendentes aprovação',   value: pendingBarbers,   icon: Users,          color: 'text-amber-600 bg-amber-50' },
    { label: 'Agendamentos ativos',   value: activeBookings,   icon: CalendarClock,  color: 'text-blue-600 bg-blue-50'   },
    { label: 'Receita plataforma/mês',value: monthRevenue,     icon: DollarSign,     color: 'text-brand-600 bg-brand-50', currency: true },
    { label: 'Flags bypass pendentes',value: flags.length,     icon: AlertTriangle,  color: 'text-red-600 bg-red-50'     },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visão geral</h1>
        <p className="text-gray-500 mt-1">Painel administrativo — Blade Club</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardBody className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-900">
                  {kpi.currency ? formatCurrency(kpi.value) : kpi.value}
                </p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  )
}
