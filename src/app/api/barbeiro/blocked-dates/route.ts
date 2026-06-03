import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data } = await supabase
    .from('barber_blocked_dates')
    .select('*')
    .eq('barber_id', user.id)
    .gte('blocked_date', new Date().toISOString().split('T')[0])
    .order('blocked_date')

  return NextResponse.json(data ?? [])
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { blocked_date, reason } = await request.json()
  if (!blocked_date) return NextResponse.json({ error: 'Data obrigatória' }, { status: 400 })

  const { data, error } = await supabase
    .from('barber_blocked_dates')
    .insert({ barber_id: user.id, blocked_date, reason: reason || null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  const { error } = await supabase
    .from('barber_blocked_dates')
    .delete()
    .eq('id', id)
    .eq('barber_id', user.id)  // garante que só o dono pode deletar

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
