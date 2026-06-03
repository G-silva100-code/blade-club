import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateCheckout } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()
  const { barber_id, service_id, address, lat, lng, distance_km, suggested_times } = body

  const { data: service } = await supabase
    .from('barber_services')
    .select('price')
    .eq('id', service_id)
    .single()

  if (!service) return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })

  const breakdown = calculateCheckout(service.price, distance_km)

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      client_id: user.id,
      barber_id,
      service_id,
      status: 'pending',
      address,
      lat,
      lng,
      distance_km,
      ...breakdown,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (suggested_times?.length) {
    await supabase.from('booking_time_suggestions').insert(
      suggested_times.map((t: string) => ({
        booking_id: booking.id,
        suggested_at: t,
        proposed_by: 'client',
      }))
    )
  }

  return NextResponse.json(booking, { status: 201 })
}

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') ?? 'client'

  const query = supabase
    .from('bookings')
    .select('*, barbers(*, profiles(*)), clients(*, profiles(*)), barber_services(*), booking_time_suggestions(*)')
    .order('created_at', { ascending: false })

  const { data } = role === 'barber'
    ? await query.eq('barber_id', user.id)
    : await query.eq('client_id', user.id)

  return NextResponse.json(data ?? [])
}
