export interface GeocodeResult {
  lat:       number
  lng:       number
  formatted: string
}

// Curitiba centro — fallback quando Google Maps não está configurado
export const CURITIBA_CENTER: GeocodeResult = {
  lat:       -25.4284,
  lng:       -49.2733,
  formatted: 'Curitiba, PR (localização aproximada)',
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY
  if (!key) return null

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?address=${encodeURIComponent(address + ', Curitiba, PR')}` +
    `&region=BR` +
    `&language=pt-BR` +
    `&key=${key}`

  try {
    const res  = await fetch(url)
    const data = await res.json()
    if (data.status !== 'OK' || !data.results[0]) return null
    const { lat, lng } = data.results[0].geometry.location
    return { lat, lng, formatted: data.results[0].formatted_address }
  } catch {
    return null
  }
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
