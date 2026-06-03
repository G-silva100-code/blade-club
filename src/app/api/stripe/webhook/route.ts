import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Webhook inválido' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object
    const bookingId = pi.metadata?.booking_id
    if (bookingId) {
      await supabase
        .from('bookings')
        .update({ stripe_payment_intent_id: pi.id })
        .eq('id', bookingId)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object
    const bookingId = pi.metadata?.booking_id
    if (bookingId) {
      await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId)
    }
  }

  return NextResponse.json({ received: true })
}
