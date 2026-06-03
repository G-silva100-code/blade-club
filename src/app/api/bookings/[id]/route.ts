import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const result = await supabase
    .from('bookings')
    .select('*, barber_services(*), booking_time_suggestions(*)')
    .eq('id', params.id)
    .single()

  const booking = result.data as Record<string, unknown> | null
  if (!booking) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  // Garante que só participantes veem
  if (booking.client_id !== user.id && booking.barber_id !== user.id) {
    return NextResponse.json({ error: 'Proibido' }, { status: 403 })
  }

  return NextResponse.json(booking)
}
