import { redirect } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Scissors, Settings,
  DollarSign, Star, Bell,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

const barbeiroNav = [
  { label: 'Dashboard',     href: '/barbeiro/dashboard',    icon: LayoutDashboard },
  { label: 'Solicitações',  href: '/barbeiro/solicitacoes', icon: Bell            },
  { label: 'Agenda',        href: '/barbeiro/agenda',       icon: Calendar        },
  { label: 'Serviços',      href: '/barbeiro/servicos',     icon: Scissors        },
  { label: 'Financeiro',    href: '/barbeiro/financeiro',   icon: DollarSign      },
  { label: 'Avaliações',    href: '/barbeiro/avaliacoes',   icon: Star            },
  { label: 'Configurações', href: '/barbeiro/configuracoes',icon: Settings        },
]

export default async function BarbeiroLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  if ((profile as { type: string } | null)?.type !== 'barber') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        <Sidebar items={barbeiroNav} title="Barbeiro" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
