import { Clock, Scissors } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { SERVICE_LABELS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import type { BarberService } from '@/types'

interface ServiceCardProps {
  service: BarberService
  onSelect?: (service: BarberService) => void
  selected?: boolean
}

export function ServiceCard({ service, onSelect, selected }: ServiceCardProps) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${selected ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Scissors className="h-4 w-4 text-brand-500" />
            <span className="text-xs font-medium text-brand-600 uppercase tracking-wider">
              {SERVICE_LABELS[service.service_type]}
            </span>
          </div>
          <h4 className="font-semibold text-gray-900">{service.name}</h4>
          <div className="flex items-center gap-1.5 mt-1.5 text-sm text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            {service.duration_minutes} min
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-gray-900">{formatCurrency(service.price)}</p>
          {onSelect && (
            <Button
              size="sm"
              variant={selected ? 'secondary' : 'primary'}
              className="mt-2"
              onClick={() => onSelect(service)}
            >
              {selected ? 'Selecionado' : 'Selecionar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
