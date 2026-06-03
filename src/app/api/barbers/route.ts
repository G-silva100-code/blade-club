import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { searchParams } = new URL(request.url)
  const serviceType = searchParams.get('servico')
  const q = searchParams.get('q')

  let query = supabase
    .from('barbers')
    .select('*, profiles(*), barber_services(*)')
    .eq('status', 'verified')
    .order('rating_avg', { ascending: false })

  if (q) {
    query = query.ilike('profiles.full_name', `%${q}%`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const filtered = serviceType
    ? data?.filter((b) =>
        (b.barber_services as { service_type: string }[]).some((s) => s.service_type === serviceType)
      )
    : data

  return NextResponse.json(filtered ?? [])
}
