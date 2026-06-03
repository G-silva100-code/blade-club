import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const initials = name
    ?.split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <div className={cn('relative rounded-full overflow-hidden bg-brand-100 flex items-center justify-center shrink-0', sizeClasses[size], className)}>
      {src ? (
        <Image src={src} alt={name ?? 'Avatar'} fill className="object-cover" />
      ) : (
        <span className="font-semibold text-brand-600">{initials}</span>
      )}
    </div>
  )
}
