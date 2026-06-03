import { travelMinutes, haversineMinutes } from './maps/distance'
import type { TimeSlot, ServiceType, DEFAULT_DURATIONS } from '@/types'

const DEFAULTS: Record<string, number> = {
  haircut: 45, beard: 30, combo: 70, treatment: 60,
}

interface BookingInterval {
  startMin: number
  endMin:   number   // startMin + duration + buffer
  lat:      number
  lng:      number
}

function timeToMin(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minToHHMM(m: number): string {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`
}

// Pré-calcula tempos de deslocamento de cada origem única até o cliente
async function buildTravelCache(
  origins: Array<{ lat: number; lng: number }>,
  clientLat: number,
  clientLng: number
): Promise<Map<string, number>> {
  const cache = new Map<string, number>()
  const key = (lat: number, lng: number) =>
    `${lat.toFixed(4)},${lng.toFixed(4)}`

  const unique = origins.filter((o, i, arr) =>
    arr.findIndex(x => key(x.lat, x.lng) === key(o.lat, o.lng)) === i
  )

  await Promise.all(
    unique.map(async (o) => {
      const k = key(o.lat, o.lng)
      const mins = await travelMinutes(o.lat, o.lng, clientLat, clientLng)
      cache.set(k, mins)
    })
  )

  return cache
}

export async function getAvailableSlots(
  supabase: ReturnType<typeof import('./supabase/server').createAdminClient>,
  barberId: string,
  date: string,         // YYYY-MM-DD
  serviceType: string,
  clientLat: number,
  clientLng: number
): Promise<TimeSlot[]> {
  // 1. Verifica data bloqueada
  const { data: blocked } = await supabase
    .from('barber_blocked_dates')
    .select('id')
    .eq('barber_id', barberId)
    .eq('blocked_date', date)
    .maybeSingle()

  if (blocked) return []

  // 2. Disponibilidade para o dia da semana
  const dayOfWeek = new Date(`${date}T12:00:00`).getDay()

  const { data: avail } = await supabase
    .from('barber_availability')
    .select('*')
    .eq('barber_id', barberId)
    .eq('day_of_week', dayOfWeek)
    .eq('active', true)
    .maybeSingle()

  if (!avail) return []

  // 3. Dados do barbeiro (base + buffer)
  const { data: barber } = await supabase
    .from('barbers')
    .select('base_lat, base_lng, buffer_minutes')
    .eq('id', barberId)
    .single()

  if (!barber?.base_lat || !barber?.base_lng) return []

  // 4. Duração do serviço
  const { data: svcDur } = await supabase
    .from('barber_service_durations')
    .select('duration_minutes')
    .eq('barber_id', barberId)
    .eq('service_type', serviceType)
    .maybeSingle()

  const svcMin    = svcDur?.duration_minutes ?? DEFAULTS[serviceType] ?? 45
  const bufferMin = barber.buffer_minutes ?? 15
  const workStart = timeToMin(avail.start_time)
  const workEnd   = timeToMin(avail.end_time)

  // 5. Agendamentos existentes no dia
  const { data: rawBookings } = await supabase
    .from('bookings')
    .select('scheduled_at, lat, lng, service_id, barber_services(service_type)')
    .eq('barber_id', barberId)
    .in('status', ['accepted', 'pending'])
    .gte('scheduled_at', `${date}T00:00:00`)
    .lte('scheduled_at', `${date}T23:59:59`)
    .order('scheduled_at', { ascending: true })

  // Monta intervalos de ocupação (em minutos desde meia-noite)
  const bookings: BookingInterval[] = (rawBookings ?? []).map((b: any) => {
    const dt = new Date(b.scheduled_at)
    const startMin = dt.getHours() * 60 + dt.getMinutes()
    const sType: string = b.barber_services?.service_type ?? 'haircut'
    const dur = DEFAULTS[sType] ?? 45
    return {
      startMin,
      endMin: startMin + dur + bufferMin,
      lat: Number(b.lat),
      lng: Number(b.lng),
    }
  })

  // 6. Pré-calcula deslocamentos (uma chamada por origem única)
  const allOrigins = [
    { lat: barber.base_lat, lng: barber.base_lng },
    ...bookings.map(b => ({ lat: b.lat, lng: b.lng })),
  ]

  const toClientCache = await buildTravelCache(allOrigins, clientLat, clientLng)
  // Deslocamentos do cliente até os destinos seguintes
  const fromClientCache = new Map<string, number>()
  await Promise.all(
    bookings.map(async (b) => {
      const k = `${b.lat.toFixed(4)},${b.lng.toFixed(4)}`
      if (!fromClientCache.has(k)) {
        const mins = await travelMinutes(clientLat, clientLng, b.lat, b.lng)
        fromClientCache.set(k, mins)
      }
    })
  )

  const getToClient   = (lat: number, lng: number) =>
    toClientCache.get(`${lat.toFixed(4)},${lng.toFixed(4)}`) ??
    haversineMinutes(lat, lng, clientLat, clientLng)

  const getFromClient = (lat: number, lng: number) =>
    fromClientCache.get(`${lat.toFixed(4)},${lng.toFixed(4)}`) ??
    haversineMinutes(clientLat, clientLng, lat, lng)

  const travelBaseToClient = getToClient(barber.base_lat, barber.base_lng)

  // 7. Itera slots de 15 em 15 minutos
  const slots: TimeSlot[] = []

  for (let t = workStart; t + svcMin <= workEnd; t += 15) {
    const svcEnd = t + svcMin

    // Verifica sobreposição com agendamentos existentes
    const overlaps = bookings.some(
      b => t < b.endMin && svcEnd + bufferMin > b.startMin
    )
    if (overlaps) continue

    // Origem de deslocamento: último agendamento antes deste slot ou base
    const prevBookings = bookings.filter(b => b.endMin <= t)
    let canArrive: boolean
    let travelMins: number

    if (prevBookings.length === 0) {
      // Barbeiro parte da base
      canArrive  = workStart + travelBaseToClient <= t
      travelMins = travelBaseToClient
    } else {
      const last  = prevBookings[prevBookings.length - 1]
      const travel = getToClient(last.lat, last.lng)
      canArrive  = last.endMin + travel <= t
      travelMins = travel
    }

    if (!canArrive) continue

    // Verifica se consegue chegar ao próximo agendamento a tempo
    const nextBookings = bookings.filter(b => b.startMin >= svcEnd)
    if (nextBookings.length > 0) {
      const next       = nextBookings[0]
      const toNext     = getFromClient(next.lat, next.lng)
      if (svcEnd + bufferMin + toNext > next.startMin) continue
    }

    slots.push({
      start:        minToHHMM(t),
      startISO:     `${date}T${minToHHMM(t)}:00`,
      end:          minToHHMM(svcEnd),
      travel_minutes: travelMins,
    })
  }

  return slots
}
