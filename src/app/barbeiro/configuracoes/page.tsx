import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ConfiguracoesForm } from '@/components/barber/ConfiguracoesForm'
import type { Barber, Profile } from '@/types'

export default async function ConfiguracoesPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userId = session.user.id

  const [profileResult, barberResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('barbers').select('*').eq('id', userId).single(),
  ])

  const profile = profileResult.data as Profile | null
  const barber  = barberResult.data  as Barber  | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500 mt-1">Gerencie seu perfil, endereço base e raio de atendimento.</p>
      </div>
      <ConfiguracoesForm profile={profile} barber={barber} />
    </div>
  )
}
