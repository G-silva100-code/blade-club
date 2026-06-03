import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { MIN_PRICES } from '@/lib/constants'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { service_type, name, price, duration_minutes } = body

  if (service_type && typeof price === 'number') {
    const min = MIN_PRICES[service_type as keyof typeof MIN_PRICES]
    if (price < min) {
      return NextResponse.json({ error: `Preço mínimo para este serviço: R$${min}` }, { status: 400 })
    }
  }

  const { data, error } = await supabase
    .from('barber_services')
    .update({ service_type, name, price, duration_minutes })
    .eq('id', params.id)
    .eq('barber_id', session.user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('barber_services')
    .delete()
    .eq('id', params.id)
    .eq('barber_id', session.user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return new Response(null, { status: 204 })
}
