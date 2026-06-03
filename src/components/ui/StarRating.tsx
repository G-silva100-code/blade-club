import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  interactive?: boolean
  onChange?: (value: number) => void
  size?: 'sm' | 'md'
}

export function StarRating({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
}: StarRatingProps) {
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn('focus:outline-none', interactive && 'cursor-pointer hover:scale-110 transition-transform')}
        >
          <Star
            className={cn(
              iconSize,
              star <= value ? 'fill-amber-400 text-amber-400' : 'fill-gray-100 text-gray-300'
            )}
          />
        </button>
      ))}
    </div>
  )
}
