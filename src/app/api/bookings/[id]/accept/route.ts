import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { scheduled_at } = await request.json()

  const { data: booking } = await supabase
    .from('bookings')
    .select('barber_id, status')
    .eq('id', params.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
  if (booking.barber_id !== user.id) return NextResponse.json({ error: 'Proibido' }, { status: 403 })
  if (booking.status !== 'pending') return NextResponse.json({ error: 'Agendamento não está pendente' }, { status: 400 })

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'accepted', scheduled_at })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
