import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { formatCurrency, formatDateShort } from '@/lib/utils'
import { DollarSign, TrendingUp } from 'lucide-react'
import type { Booking, BarberService } from '@/types'

interface CompletedBooking extends Booking {
  barber_services: Pick<BarberService, 'name'>
}

export default async function FinanceiroPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  if (!user) return null

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const result = await supabase
    .from('bookings')
    .select('*, barber_services(name)')
    .eq('barber_id', user!.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  const completedBookings = (result.data as CompletedBooking[] | null) ?? []
  const monthBookings = completedBookings.filter((b) => b.created_at >= startOfMonth)

  const monthGross   = monthBookings.reduce((s, b) => s + b.service_price, 0)
  const monthFee     = monthBookings.reduce((s, b) => s + b.platform_fee, 0)
  const monthTravel  = monthBookings.reduce((s, b) => s + b.travel_fee, 0)
  const monthNet     = monthBookings.reduce((s, b) => s + b.barber_payout, 0)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento bruto', value: monthGross, icon: TrendingUp, color: 'text-blue-600 bg-blue-50' },
          { label: 'Comissão plataforma', value: monthFee, icon: DollarSign, color: 'text-red-500 bg-red-50' },
          { label: 'Taxa deslocamento', value: monthTravel, icon: DollarSign, color: 'text-green-600 bg-green-50' },
          { label: 'Líquido recebido', value: monthNet, icon: DollarSign, color: 'text-brand-600 bg-brand-50' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardBody className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(kpi.value)}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Histórico de atendimentos</h2>
        </CardHeader>
        <CardBody>
          {!completedBookings.length ? (
            <p className="text-gray-400 text-sm text-center py-6">Nenhum atendimento concluído ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-3 text-gray-500 font-medium">Data</th>
                    <th className="text-left pb-3 text-gray-500 font-medium">Serviço</th>
                    <th className="text-right pb-3 text-gray-500 font-medium">Valor serviço</th>
                    <th className="text-right pb-3 text-gray-500 font-medium">Comissão</th>
                    <th className="text-right pb-3 text-gray-500 font-medium">Deslocamento</th>
                    <th className="text-right pb-3 text-gray-500 font-medium">Líquido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {completedBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="py-3 text-gray-500">{formatDateShort(booking.created_at)}</td>
                      <td className="py-3 text-gray-900">{booking.barber_services.name}</td>
                      <td className="py-3 text-right text-gray-900">{formatCurrency(booking.service_price)}</td>
                      <td className="py-3 text-right text-red-500">-{formatCurrency(booking.platform_fee)}</td>
                      <td className="py-3 text-right text-green-600">+{formatCurrency(booking.travel_fee)}</td>
                      <td className="py-3 text-right font-semibold text-gray-900">{formatCurrency(booking.barber_payout)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
