import { Sidebar } from '@/components/layout/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
