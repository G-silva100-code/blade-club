import { Sidebar } from '@/components/layout/Sidebar'

export default function BarbeiroLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8 flex gap-8">
        <Sidebar type="barbeiro" title="Barbeiro" />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
