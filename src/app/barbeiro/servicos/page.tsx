import { createClient } from '@/lib/supabase/server'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ServiceCard } from '@/components/barber/ServiceCard'
import { Plus } from 'lucide-react'
import type { BarberService } from '@/types'

export default async function ServicosPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const result = await supabase
    .from('barber_services')
    .select('*')
    .eq('barber_id', user!.id)
    .order('service_type')

  const services = (result.data as BarberService[] | null) ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Meus Serviços</h1>
        <button className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors">
          <Plus className="h-4 w-4" /> Adicionar serviço
        </button>
      </div>

      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">
            Defina os serviços que você oferece e seus respectivos preços. Preços mínimos: Corte R$80 | Barba R$70 | Combo R$130 | Tratamento R$120
          </p>
        </CardHeader>
        <CardBody>
          {!services.length ? (
            <div className="text-center py-10 text-gray-400">
              <p>Nenhum serviço cadastrado ainda.</p>
              <p className="text-sm mt-1">Adicione seus serviços para aparecer nas buscas.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
