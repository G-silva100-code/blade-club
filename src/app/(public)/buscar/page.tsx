import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BarberCard } from '@/components/barber/BarberCard'
import { Search } from 'lucide-react'
import type { BarberWithProfile } from '@/types'

export const metadata = {
  title: 'Encontrar barbeiro',
  description: 'Encontre barbeiros verificados Blade Club disponíveis na sua região em Curitiba.',
}

interface SearchParams {
  servico?: string
  q?: string
}

export default async function BuscarPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createClient()

  const result = await supabase
    .from('barbers')
    .select('*, profiles(*), barber_services(*)')
    .eq('status', 'verified')
    .order('rating_avg', { ascending: false })

  const barbers = (result.data as BarberWithProfile[] | null) ?? []

  const filtered = searchParams.servico
    ? barbers.filter((b) => b.barber_services.some((s) => s.service_type === searchParams.servico))
    : barbers

  return (
    <>
      <Header />
      <main className="min-h-screen bg-blade-bg">
        <div className="border-b border-blade-border bg-blade-card py-10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px w-8 bg-gold" />
              <span className="text-gold text-xs tracking-[0.3em] uppercase font-medium">Blade Club</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-blade-text mb-6">Encontrar barbeiro</h1>

            <form className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-60">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-blade-muted" />
                <input
                  name="q"
                  defaultValue={searchParams.q}
                  placeholder="Buscar por nome..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-blade-bg border border-blade-border text-sm text-blade-text placeholder:text-blade-muted focus:outline-none focus:border-gold transition-colors"
                />
              </div>
              <select
                name="servico"
                defaultValue={searchParams.servico}
                className="rounded-xl bg-blade-bg border border-blade-border px-4 py-2.5 text-sm text-blade-text focus:outline-none focus:border-gold transition-colors"
              >
                <option value="">Todos os serviços</option>
                <option value="haircut">Corte</option>
                <option value="beard">Barba</option>
                <option value="combo">Combo</option>
                <option value="treatment">Tratamento capilar</option>
              </select>
              <button
                type="submit"
                className="rounded-xl bg-gold px-6 py-2.5 text-sm font-semibold text-blade-bg hover:bg-gold-light transition-colors"
              >
                Buscar
              </button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-10">
          {!filtered.length ? (
            <div className="text-center py-20 text-blade-muted">
              <p className="font-display text-xl mb-2">Nenhum barbeiro disponível ainda.</p>
              <p className="text-sm">Em breve novos parceiros na sua região.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((barber) => (
                <BarberCard key={barber.id} barber={barber} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
