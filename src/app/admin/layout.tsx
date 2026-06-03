import { redirect } from 'next/navigation'
import { Users, Flag, LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

const adminNav = [
  { label: 'Visão geral',   href: '/admin',           icon: LayoutDashboard },
  { label: 'Barbeiros',     href: '/admin/barbeiros',  icon: Users },
  { label: 'Flags bypass',  href: '/admin/flags',      icon: Flag },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  if (profile?.type !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-3 text-sm font-medium">
        Painel administrativo — BarberApp
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        <Sidebar items={adminNav} title="Admin" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
