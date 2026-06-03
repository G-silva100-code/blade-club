import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('barbers')
    .select('buffer_minutes, service_radius_km, base_address, base_lat, base_lng')
    .eq('id', user.id)
    .single()

  return NextResponse.json(data ?? {})
}

export async function PUT(request: Request) {
  return handleUpdate(request)
}

export async function PATCH(request: Request) {
  return handleUpdate(request)
}

async function handleUpdate(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const body = await request.json()

  const profileFields = ['full_name', 'phone']
  const barberFields  = ['bio', 'instagram_url', 'service_radius_km', 'base_address', 'base_lat', 'base_lng', 'buffer_minutes']

  const profileUpdate = Object.fromEntries(
    Object.entries(body).filter(([k]) => profileFields.includes(k))
  )
  const barberUpdate = Object.fromEntries(
    Object.entries(body).filter(([k]) => barberFields.includes(k))
  )

  if (Object.keys(profileUpdate).length > 0) {
    const { error } = await supabase.from('profiles').update(profileUpdate).eq('id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (Object.keys(barberUpdate).length > 0) {
    const { error } = await supabase.from('barbers').update(barberUpdate).eq('id', user.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
