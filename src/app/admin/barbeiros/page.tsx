import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatDateShort } from '@/lib/utils'
import type { Barber, Profile } from '@/types'

interface BarberRow extends Barber {
  profiles: Profile
}

export default async function AdminBarbeirosPage() {
  const supabase = createClient()

  const [pendingResult, allResult] = await Promise.all([
    supabase.from('barbers').select('*, profiles(*)').eq('status', 'pending').order('created_at', { ascending: true }),
    supabase.from('barbers').select('*, profiles(*)').order('created_at', { ascending: false }).limit(50),
  ])

  const pending = (pendingResult.data as BarberRow[] | null) ?? []
  const all     = (allResult.data as BarberRow[] | null) ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Barbeiros</h1>

      {pending.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              Pendentes de aprovação
              <Badge variant="warning">{pending.length}</Badge>
            </h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {pending.map((barber) => (
                <div key={barber.id} className="flex items-center gap-4 p-3 rounded-xl bg-amber-50 ring-1 ring-amber-100">
                  <Avatar src={barber.profiles.avatar_url} name={barber.profiles.full_name} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{barber.profiles.full_name}</p>
                    <p className="text-sm text-gray-500">{barber.profiles.cpf} · {barber.profiles.phone}</p>
                    <p className="text-xs text-gray-400">Raio: {barber.service_radius_km}km · Cadastrado {formatDateShort(barber.created_at)}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <form action={`/api/admin/barbers/${barber.id}/approve`} method="POST">
                      <button type="submit" className="rounded-full bg-green-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-600">
                        Aprovar
                      </button>
                    </form>
                    <form action={`/api/admin/barbers/${barber.id}/suspend`} method="POST">
                      <button type="submit" className="rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-red-600">
                        Rejeitar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Todos os barbeiros</h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left pb-3 text-gray-500 font-medium">Barbeiro</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Nota</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Advertências</th>
                  <th className="text-left pb-3 text-gray-500 font-medium">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {all.map((barber) => {
                  const statusMap: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
                    pending: 'warning', verified: 'success', suspended: 'danger', banned: 'danger',
                  }
                  return (
                    <tr key={barber.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar src={barber.profiles.avatar_url} name={barber.profiles.full_name} size="sm" />
                          <span className="font-medium text-gray-900">{barber.profiles.full_name}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={statusMap[barber.status] ?? 'default'}>{barber.status}</Badge>
                      </td>
                      <td className="py-3 text-gray-700">{barber.rating_avg.toFixed(1)} ({barber.rating_count})</td>
                      <td className="py-3">
                        {barber.warnings_count > 0 ? (
                          <Badge variant="warning">{barber.warnings_count}</Badge>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-3 text-gray-500">{formatDateShort(barber.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
