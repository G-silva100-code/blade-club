export const MIN_PRICES = {
  haircut:   Number(process.env.NEXT_PUBLIC_MIN_PRICE_HAIRCUT   ?? 80),
  beard:     Number(process.env.NEXT_PUBLIC_MIN_PRICE_BEARD     ?? 70),
  combo:     Number(process.env.NEXT_PUBLIC_MIN_PRICE_COMBO     ?? 130),
  treatment: Number(process.env.NEXT_PUBLIC_MIN_PRICE_TREATMENT ?? 120),
} as const

export const TRAVEL = {
  FREE_KM:        Number(process.env.NEXT_PUBLIC_FREE_TRAVEL_KM      ?? 3),
  FEE_PER_KM:     Number(process.env.NEXT_PUBLIC_TRAVEL_FEE_PER_KM   ?? 2),
} as const

export const CANCELLATION_WINDOW_HOURS = Number(
  process.env.NEXT_PUBLIC_CANCELLATION_WINDOW_HOURS ?? 4
)

export const PLATFORM_COMMISSION = Number(
  process.env.NEXT_PUBLIC_PLATFORM_COMMISSION ?? 0.3
)

export const SERVICE_RADIUS = {
  MIN_KM: 2,
  MAX_KM: 30,
} as const

export const REPUTATION = {
  MIN_RATING_TO_STAY: 3.5,
  NEW_BARBER_WEEKLY_LIMIT: 5,
  NEW_BARBER_REVIEW_THRESHOLD: 10,
  NEW_BARBER_HIGHLIGHT_DAYS: 30,
} as const

export const BYPASS_PATTERNS = [
  /\b\d{4,5}[-\s]?\d{4,5}\b/,
  /@[\w.]+/,
  /https?:\/\//,
  /whatsapp/i,
  /zap/i,
]

export const SERVICE_LABELS: Record<string, string> = {
  haircut:   'Corte',
  beard:     'Barba',
  combo:     'Combo Corte + Barba',
  treatment: 'Tratamento Capilar',
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending:        'Aguardando barbeiro',
  accepted:       'Confirmado',
  rejected:       'Recusado',
  completed:      'Concluído',
  cancelled:      'Cancelado',
  no_show_client: 'Cliente não atendeu',
  no_show_barber: 'Barbeiro não apareceu',
}
