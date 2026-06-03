import Link from 'next/link'
import { MapPin, Shield } from 'lucide-react'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { formatCurrency } from '@/lib/utils'
import type { BarberWithProfile } from '@/types'

interface BarberCardProps {
  barber: BarberWithProfile
  distanceKm?: number
}

export function BarberCard({ barber, distanceKm }: BarberCardProps) {
  const minPrice = barber.barber_services.length
    ? Math.min(...barber.barber_services.filter((s) => s.active).map((s) => s.price))
    : null

  const isNew = barber.rating_count < 10

  return (
    <Link href={`/barbeiros/${barber.id}`} className="block group">
      <div className="bg-blade-card border border-blade-border rounded-2xl p-5 hover:border-gold transition-all">
        <div className="flex items-start gap-4">
          <Avatar
            src={barber.profiles.avatar_url}
            name={barber.profiles.full_name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display font-bold text-blade-text truncate group-hover:text-gold transition-colors">
                {barber.profiles.full_name}
              </h3>
              {barber.status === 'verified' && (
                <Shield className="h-3.5 w-3.5 text-gold shrink-0" aria-label="Verificado" />
              )}
              {isNew && <Badge variant="info">Novo</Badge>}
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <StarRating value={barber.rating_avg} size="sm" />
              <span className="text-xs text-blade-muted">
                {barber.rating_avg.toFixed(1)} ({barber.rating_count})
              </span>
            </div>

            {distanceKm !== undefined && (
              <div className="flex items-center gap-1 mt-1.5 text-xs text-blade-muted">
                <MapPin className="h-3 w-3" />
                {distanceKm.toFixed(1)} km de distância
              </div>
            )}
          </div>

          {minPrice && (
            <div className="text-right shrink-0">
              <p className="text-[10px] text-blade-muted">a partir de</p>
              <p className="text-lg font-bold text-gold">{formatCurrency(minPrice)}</p>
            </div>
          )}
        </div>

        {barber.barber_services.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {barber.barber_services
              .filter((s) => s.active)
              .slice(0, 3)
              .map((service) => (
                <span
                  key={service.id}
                  className="inline-flex items-center rounded-full border border-blade-border px-2.5 py-0.5 text-xs text-blade-muted"
                >
                  {service.name}
                </span>
              ))}
          </div>
        )}
      </div>
    </Link>
  )
}
