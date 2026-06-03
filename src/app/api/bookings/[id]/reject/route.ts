import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('barber_id, status')
    .eq('id', params.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  if (booking.barber_id !== user.id) return NextResponse.json({ error: 'Proibido' }, { status: 403 })
  if (booking.status !== 'pending') return NextResponse.json({ error: 'Não está pendente' }, { status: 400 })

  await supabase.from('bookings').update({ status: 'rejected' }).eq('id', params.id)

  return NextResponse.json({ ok: true })
}
