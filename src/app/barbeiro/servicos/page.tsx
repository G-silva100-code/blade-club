import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ServicosManager } from '@/components/barber/ServicosManager'
import type { BarberService } from '@/types'

export default async function ServicosPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data } = await supabase
    .from('barber_services')
    .select('*')
    .eq('barber_id', session.user.id)
    .order('service_type')

  const services = (data as BarberService[] | null) ?? []

  return <ServicosManager initialServices={services} />
}
