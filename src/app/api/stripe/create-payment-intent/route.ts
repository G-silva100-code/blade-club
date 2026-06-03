import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentIntent } from '@/lib/stripe/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { booking_id } = await request.json()

  const { data: booking } = await supabase
    .from('bookings')
    .select('*, barbers(stripe_account_id), clients(stripe_customer_id)')
    .eq('id', booking_id)
    .single()

  if (!booking) return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })
  if (booking.client_id !== user.id) return NextResponse.json({ error: 'Proibido' }, { status: 403 })
  if (booking.status !== 'accepted') return NextResponse.json({ error: 'Agendamento não está aceito' }, { status: 400 })

  const barber = booking.barbers as { stripe_account_id: string | null }
  const client = booking.clients as { stripe_customer_id: string | null }

  if (!barber.stripe_account_id) {
    return NextResponse.json({ error: 'Barbeiro sem conta Stripe configurada' }, { status: 400 })
  }
  if (!client.stripe_customer_id) {
    return NextResponse.json({ error: 'Cliente sem perfil Stripe' }, { status: 400 })
  }

  const pi = await createPaymentIntent(
    Math.round(booking.total_amount * 100),
    client.stripe_customer_id,
    barber.stripe_account_id,
    Math.round(booking.platform_fee * 100),
    { booking_id }
  )

  return NextResponse.json({ client_secret: pi.client_secret })
}
