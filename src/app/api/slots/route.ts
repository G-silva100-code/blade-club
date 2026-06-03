import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAvailableSlots } from '@/lib/slots'

// GET /api/slots?barber_id=X&date=YYYY-MM-DD&service_type=haircut&lat=Y&lng=Z
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const barber_id    = searchParams.get('barber_id')
  const date         = searchParams.get('date')
  const service_type = searchParams.get('service_type')
  const lat          = searchParams.get('lat')
  const lng          = searchParams.get('lng')

  if (!barber_id || !date || !service_type || !lat || !lng) {
    return NextResponse.json(
      { error: 'Parâmetros obrigatórios: barber_id, date, service_type, lat, lng' },
      { status: 400 }
    )
  }

  const clientLat = parseFloat(lat)
  const clientLng = parseFloat(lng)

  if (isNaN(clientLat) || isNaN(clientLng)) {
    return NextResponse.json({ error: 'lat/lng inválidos' }, { status: 400 })
  }

  // Valida formato YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Formato de data inválido (YYYY-MM-DD)' }, { status: 400 })
  }

  // Não permite datas passadas
  const today = new Date().toISOString().split('T')[0]
  if (date < today) {
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const supabase = createAdminClient()
    const slots = await getAvailableSlots(
      supabase,
      barber_id,
      date,
      service_type,
      clientLat,
      clientLng
    )

    return NextResponse.json(slots, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
