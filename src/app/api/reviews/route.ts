import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { booking_id, reviewed_id, rating, comment, portfolio_photo_url } = await request.json()

  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating inválido' }, { status: 400 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('client_id, barber_id, status')
    .eq('id', booking_id)
    .single()

  if (!booking || booking.status !== 'completed') {
    return NextResponse.json({ error: 'Agendamento não concluído' }, { status: 400 })
  }

  const isParticipant = [booking.client_id, booking.barber_id].includes(user.id)
  if (!isParticipant) return NextResponse.json({ error: 'Proibido' }, { status: 403 })

  const { error } = await supabase.from('reviews').insert({
    booking_id,
    reviewer_id: user.id,
    reviewed_id,
    rating,
    comment,
    portfolio_photo_url,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Atualiza rating médio do barbeiro
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewed_id', booking.barber_id)

  if (reviews?.length) {
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    await supabase.from('barbers').update({
      rating_avg: Math.round(avg * 10) / 10,
      rating_count: reviews.length,
    }).eq('id', booking.barber_id)
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
