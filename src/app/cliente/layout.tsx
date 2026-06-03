import { redirect } from 'next/navigation'
import { LayoutDashboard, CalendarDays, MessageSquare, History } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

const clienteNav = [
  { label: 'Dashboard',         href: '/cliente/dashboard',     icon: LayoutDashboard },
  { label: 'Agendamentos',      href: '/cliente/agendamentos',  icon: CalendarDays },
  { label: 'Histórico',         href: '/cliente/historico',     icon: History },
  { label: 'Mensagens',         href: '/cliente/chat',          icon: MessageSquare },
]

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  if (profile?.type !== 'client') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        <Sidebar items={clienteNav} title="Cliente" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
