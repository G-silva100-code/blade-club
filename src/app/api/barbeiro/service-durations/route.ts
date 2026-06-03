import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { DEFAULT_DURATIONS } from '@/types'
import type { ServiceType } from '@/types'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('barber_service_durations')
    .select('*')
    .eq('barber_id', user.id)

  // Retorna os 4 tipos sempre, preenchendo defaults se não configurados
  const map = Object.fromEntries((data ?? []).map((r: { service_type: string; duration_minutes: number }) => [r.service_type, r.duration_minutes]))
  const result = (Object.keys(DEFAULT_DURATIONS) as ServiceType[]).map(st => ({
    service_type:     st,
    duration_minutes: map[st] ?? DEFAULT_DURATIONS[st],
  }))

  return NextResponse.json(result)
}

export async function PUT(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body: Array<{ service_type: ServiceType; duration_minutes: number }> = await request.json()

  const records = body.map(r => ({
    barber_id:        user.id,
    service_type:     r.service_type,
    duration_minutes: Math.max(5, r.duration_minutes),
  }))

  const { error } = await supabase
    .from('barber_service_durations')
    .upsert(records, { onConflict: 'barber_id,service_type' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
