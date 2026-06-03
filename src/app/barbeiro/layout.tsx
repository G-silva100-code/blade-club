import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function BarbeiroLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  if ((profile as { type: string } | null)?.type !== 'barber') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        <Sidebar type="barbeiro" title="Barbeiro" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
