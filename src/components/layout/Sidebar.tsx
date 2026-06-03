'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, Scissors, Settings,
  DollarSign, Star, Bell, CalendarDays, History,
  MessageSquare, Users, Flag,
} from 'lucide-react'

type NavType = 'barbeiro' | 'cliente' | 'admin'

const NAV_CONFIG: Record<NavType, Array<{ label: string; href: string; icon: React.ElementType }>> = {
  barbeiro: [
    { label: 'Dashboard',     href: '/barbeiro/dashboard',    icon: LayoutDashboard },
    { label: 'Solicitações',  href: '/barbeiro/solicitacoes', icon: Bell            },
    { label: 'Agenda',        href: '/barbeiro/agenda',       icon: Calendar        },
    { label: 'Serviços',      href: '/barbeiro/servicos',     icon: Scissors        },
    { label: 'Financeiro',    href: '/barbeiro/financeiro',   icon: DollarSign      },
    { label: 'Avaliações',    href: '/barbeiro/avaliacoes',   icon: Star            },
    { label: 'Configurações', href: '/barbeiro/configuracoes',icon: Settings        },
  ],
  cliente: [
    { label: 'Dashboard',    href: '/cliente/dashboard',    icon: LayoutDashboard },
    { label: 'Agendamentos', href: '/cliente/agendamentos', icon: CalendarDays    },
    { label: 'Histórico',    href: '/cliente/historico',    icon: History         },
    { label: 'Mensagens',    href: '/cliente/chat',         icon: MessageSquare   },
  ],
  admin: [
    { label: 'Visão geral',   href: '/admin',           icon: LayoutDashboard },
    { label: 'Barbeiros',     href: '/admin/barbeiros', icon: Users           },
    { label: 'Flags bypass',  href: '/admin/flags',     icon: Flag            },
  ],
}

interface SidebarProps {
  type:  NavType
  title: string
}

export function Sidebar({ type, title }: SidebarProps) {
  const pathname = usePathname()
  const items    = NAV_CONFIG[type]

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4 px-3">
          {title}
        </p>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon   = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
