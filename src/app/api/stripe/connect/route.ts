import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createConnectAccount, createAccountLink } from '@/lib/stripe/server'

export async function POST(_request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  if (profile?.type !== 'barber') return NextResponse.json({ error: 'Proibido' }, { status: 403 })

  const { data: barber } = await supabase
    .from('barbers')
    .select('stripe_account_id')
    .eq('id', user.id)
    .single()

  let accountId = barber?.stripe_account_id

  if (!accountId) {
    const account = await createConnectAccount(user.email!)
    accountId = account.id
    await supabase.from('barbers').update({ stripe_account_id: accountId }).eq('id', user.id)
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
  const link = await createAccountLink(accountId, baseUrl)

  return NextResponse.json({ url: link.url })
}
