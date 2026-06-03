import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MIN_PRICES } from '@/lib/constants'

export async function POST(req: Request) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { service_type, name, price, duration_minutes } = body

  const min = MIN_PRICES[service_type as keyof typeof MIN_PRICES]
  if (!name || !service_type) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 })
  if (typeof price !== 'number' || price < min) {
    return NextResponse.json({ error: `Preço mínimo para este serviço: R$${min}` }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('barber_services')
    .insert({
      barber_id:        session.user.id,
      service_type,
      name,
      price,
      duration_minutes: duration_minutes ?? 60,
      active:           true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
