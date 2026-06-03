import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  if (profile?.type !== 'admin') return NextResponse.json({ error: 'Proibido' }, { status: 403 })

  const { permanent } = await request.json().catch(() => ({ permanent: false }))

  const admin = createAdminClient()

  if (permanent) {
    await admin.from('barbers').update({ status: 'banned' }).eq('id', params.id)
  } else {
    await admin.from('barbers').update({ status: 'suspended' }).eq('id', params.id)
    await admin.rpc('increment_barber_warnings', { barber_id: params.id })
  }

  return NextResponse.json({ ok: true })
}
