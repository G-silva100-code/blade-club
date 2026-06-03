import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { BookingFlow } from '@/components/booking/BookingFlow'
import type { Barber, BarberService, Profile } from '@/types'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const r = await supabase.from('profiles').select('full_name').eq('id', params.id).single()
  const p = r.data as { full_name: string } | null
  return { title: p ? `Agendar com ${p.full_name}` : 'Agendar' }
}

export default async function AgendarPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  if (!user) return null
  if (!user) redirect(`/login?redirectTo=/agendar/${params.id}`)

  const [barberResult, profileResult, servicesResult] = await Promise.all([
    supabase.from('barbers').select('*').eq('id', params.id).single(),
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('barber_services').select('*').eq('barber_id', params.id).eq('active', true),
  ])

  const barber   = barberResult.data   as Barber | null
  const profile  = profileResult.data  as Profile | null
  const services = (servicesResult.data as BarberService[] | null) ?? []

  if (!barber || !profile || barber.status !== 'verified') notFound()
  if (!barber.base_lat || !barber.base_lng) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-500">Este barbeiro ainda não configurou seu endereço base.</p>
          <Link href={`/barbeiros/${params.id}`} className="mt-4 inline-block text-amber-600 hover:underline">
            Voltar ao perfil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-lg px-4 py-8">
        {/* Back */}
        <Link
          href={`/barbeiros/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao perfil
        </Link>

        {/* Barber mini-card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 mb-8 flex items-center gap-4">
          <Avatar src={profile.avatar_url} name={profile.full_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-display font-bold text-gray-900 truncate">{profile.full_name}</p>
              {barber.status === 'verified' && (
                <Shield className="h-4 w-4 text-amber-500 shrink-0" />
              )}
            </div>
            <StarRating value={barber.rating_avg} size="sm" />
            <p className="text-xs text-gray-400 mt-0.5">{barber.rating_count} avaliações</p>
          </div>
        </div>

        {/* Booking wizard */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-6">
          {services.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>Este barbeiro ainda não tem serviços cadastrados.</p>
            </div>
          ) : (
            <BookingFlow
              barber={{
                id:         barber.id,
                name:       profile.full_name,
                rating_avg: barber.rating_avg,
                base_lat:   barber.base_lat!,
                base_lng:   barber.base_lng!,
              }}
              services={services}
            />
          )}
        </div>
      </div>
    </div>
  )
}
