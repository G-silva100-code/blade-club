import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { refundPaymentIntent } from '@/lib/stripe/server'
import { hoursUntil } from '@/lib/utils'
import { CANCELLATION_WINDOW_HOURS } from '@/lib/constants'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: booking } = await supabase
    .from('bookings')
    .select('client_id, barber_id, status, scheduled_at, total_amount, stripe_payment_intent_id')
    .eq('id', params.id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const isClient = booking.client_id === user.id
  const isBarber = booking.barber_id === user.id
  if (!isClient && !isBarber) return NextResponse.json({ error: 'Proibido' }, { status: 403 })
  if (!['pending', 'accepted'].includes(booking.status)) {
    return NextResponse.json({ error: 'Não pode cancelar este agendamento' }, { status: 400 })
  }

  let refundAmount: number | undefined
  if (isClient && booking.stripe_payment_intent_id && booking.scheduled_at) {
    const hoursLeft = hoursUntil(booking.scheduled_at)
    refundAmount = hoursLeft >= CANCELLATION_WINDOW_HOURS
      ? booking.total_amount * 100
      : Math.round(booking.total_amount * 0.5 * 100)
  }

  if (booking.stripe_payment_intent_id && refundAmount) {
    await refundPaymentIntent(booking.stripe_payment_intent_id, refundAmount)
  }

  await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', params.id)

  return NextResponse.json({ ok: true })
}
