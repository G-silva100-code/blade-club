import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  if (profile?.type !== 'admin') return NextResponse.json({ error: 'Proibido' }, { status: 403 })

  const admin = createAdminClient()
  const { error } = await admin.from('barbers').update({ status: 'verified' }).eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
