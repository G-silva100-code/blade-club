import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BarberAvailability } from '@/types'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data, error } = await supabase
    .from('barber_availability')
    .select('*')
    .eq('barber_id', user.id)
    .order('day_of_week')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body: Array<Pick<BarberAvailability, 'day_of_week' | 'start_time' | 'end_time' | 'active'>> =
    await request.json()

  // Upsert: insere ou atualiza por (barber_id, day_of_week)
  const records = body.map(r => ({
    barber_id:   user.id,
    day_of_week: r.day_of_week,
    start_time:  r.start_time,
    end_time:    r.end_time,
    active:      r.active,
  }))

  const { error } = await supabase
    .from('barber_availability')
    .upsert(records, { onConflict: 'barber_id,day_of_week' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
