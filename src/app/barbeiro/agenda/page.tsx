import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AgendaTabs } from '@/components/agenda/AgendaTabs'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Agenda' }

export default async function AgendaPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  if (!user) return null
  if (!user) redirect('/login')

  const { data: barber } = await supabase
    .from('barbers')
    .select('status, base_address')
    .eq('id', user.id)
    .single()

  const barberData = barber as { status: string; base_address: string | null } | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Agenda inteligente</h1>
        <p className="text-gray-500 mt-1">
          Configure sua disponibilidade. O sistema calcula automaticamente os slots reais considerando
          deslocamento, duração do serviço e buffer entre atendimentos.
        </p>
      </div>

      {barberData?.status !== 'verified' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Sua conta está pendente de aprovação. Você pode configurar sua agenda agora — ela será ativada assim que aprovado.
        </div>
      )}

      {!barberData?.base_address && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          Configure seu <strong>endereço base</strong> na aba Configurações para que o cálculo de deslocamento funcione corretamente.
        </div>
      )}

      <AgendaTabs />
    </div>
  )
}
