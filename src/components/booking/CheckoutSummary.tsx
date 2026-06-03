import { formatCurrency } from '@/lib/utils'
import type { CheckoutBreakdown } from '@/types'

interface CheckoutSummaryProps {
  breakdown: CheckoutBreakdown
  distanceKm: number
  serviceName: string
}

export function CheckoutSummary({ breakdown, distanceKm, serviceName }: CheckoutSummaryProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-5 space-y-3">
      <h3 className="font-semibold text-gray-900">Resumo do pedido</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>{serviceName}</span>
          <span>{formatCurrency(breakdown.service_price)}</span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span>Deslocamento ({distanceKm.toFixed(1)} km)</span>
          <span>
            {breakdown.travel_fee === 0 ? (
              <span className="text-green-600">Grátis</span>
            ) : (
              formatCurrency(breakdown.travel_fee)
            )}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
          <span>Total</span>
          <span>{formatCurrency(breakdown.total_amount)}</span>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        O pagamento é cobrado apenas quando o barbeiro confirmar o agendamento.
      </p>
    </div>
  )
}
