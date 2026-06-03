import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatDate } from '@/lib/utils'
import { AlertTriangle } from 'lucide-react'
import type { BypassFlag } from '@/types'

export default async function AdminFlagsPage() {
  const supabase = createClient()

  const result = await supabase
    .from('bypass_flags')
    .select('*')
    .eq('reviewed', false)
    .order('created_at', { ascending: false })

  const flags = (result.data as BypassFlag[] | null) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Flags de Bypass</h1>
        {flags.length > 0 && <Badge variant="danger">{flags.length} pendentes</Badge>}
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">
            Tentativas detectadas de contato fora da plataforma. Revisar manualmente e aplicar sanções se comprovado.
          </p>
        </CardHeader>
        <CardBody>
          {!flags.length ? (
            <div className="text-center py-10 text-gray-400">
              <AlertTriangle className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>Nenhuma flag pendente de revisão.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flags.map((flag) => (
                <div key={flag.id} className="rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Agendamento #{flag.booking_id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600 mt-1">{flag.reason}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(flag.created_at)}</p>
                    </div>
                    <form action={`/api/admin/flags/${flag.id}/review`} method="POST">
                      <button
                        type="submit"
                        className="rounded-full bg-gray-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-700"
                      >
                        Marcar revisado
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
