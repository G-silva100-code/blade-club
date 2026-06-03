export interface DistanceResult {
  distance_km: number
  duration_minutes: number
}

export async function getDistanceMatrix(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<DistanceResult> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) throw new Error('GOOGLE_MAPS_API_KEY não configurada')

  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json` +
    `?origins=${originLat},${originLng}` +
    `&destinations=${destLat},${destLng}` +
    `&mode=driving` +
    `&language=pt-BR` +
    `&key=${key}`

  const res = await fetch(url, { next: { revalidate: 300 } })  // cache 5 min
  const data = await res.json()

  if (data.status !== 'OK') {
    throw new Error(`Distance Matrix API: ${data.status}`)
  }

  const element = data.rows?.[0]?.elements?.[0]
  if (!element || element.status !== 'OK') {
    throw new Error(`Rota não encontrada: ${element?.status}`)
  }

  return {
    distance_km:      element.distance.value / 1000,
    duration_minutes: Math.ceil(element.duration.value / 60),
  }
}

// Fallback quando a API não está configurada — Haversine + velocidade média urbana
export function haversineMinutes(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  const distKm = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  // 25 km/h média Curitiba (trânsito)
  return Math.max(5, Math.ceil((distKm / 25) * 60))
}

export async function travelMinutes(
  originLat: number, originLng: number,
  destLat: number, destLng: number
): Promise<number> {
  try {
    const r = await getDistanceMatrix(originLat, originLng, destLat, destLng)
    return r.duration_minutes
  } catch {
    return haversineMinutes(originLat, originLng, destLat, destLng)
  }
}
