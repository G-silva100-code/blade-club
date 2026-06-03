import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('type').eq('id', user.id).single()
  if ((profile as { type: string } | null)?.type !== 'admin') redirect('/')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gray-900 text-white px-6 py-3 text-sm font-medium">
        Painel administrativo — Blade Club
      </div>
      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        <Sidebar type="admin" title="Admin" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
