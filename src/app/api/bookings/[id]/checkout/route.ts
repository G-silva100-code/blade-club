import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('barber_id, check_in_at')
    .eq('id', params.id)
    .single()

  if (!booking || booking.barber_id !== user.id) return NextResponse.json({ error: 'Proibido' }, { status: 403 })
  if (!booking.check_in_at) return NextResponse.json({ error: 'Check-in ainda não foi feito' }, { status: 400 })

  await supabase.from('bookings').update({
    check_out_at: new Date().toISOString(),
    status: 'completed',
  }).eq('id', params.id)

  return NextResponse.json({ ok: true })
}
