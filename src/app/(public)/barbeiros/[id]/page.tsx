import { notFound } from 'next/navigation'
import { MapPin, Shield, Instagram } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { ServiceCard } from '@/components/barber/ServiceCard'
import type { Metadata } from 'next'
import type { Barber, BarberService, Profile, Review } from '@/types'

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('full_name').eq('id', params.id).single()
  const name = (data as Profile | null)?.full_name
  return { title: name ?? 'Barbeiro não encontrado' }
}

export default async function BarberProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const [barberResult, profileResult, servicesResult, reviewsResult] = await Promise.all([
    supabase.from('barbers').select('*').eq('id', params.id).single(),
    supabase.from('profiles').select('*').eq('id', params.id).single(),
    supabase.from('barber_services').select('*').eq('barber_id', params.id).eq('active', true),
    supabase.from('reviews').select('*').eq('reviewed_id', params.id)
      .order('created_at', { ascending: false }).limit(10),
  ])

  const b = barberResult.data as Barber | null
  const p = profileResult.data as Profile | null
  const activeServices = (servicesResult.data as BarberService[] | null) ?? []
  const reviewList = (reviewsResult.data as Review[] | null) ?? []

  if (!b || !p || b.status === 'banned') notFound()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="mx-auto max-w-4xl px-6 space-y-6">
          {/* Header do perfil */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <Avatar src={p.avatar_url} name={p.full_name} size="xl" />
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{p.full_name}</h1>
                  {b.status === 'verified' && (
                    <Badge variant="success">
                      <Shield className="h-3 w-3 mr-1" /> Verificado
                    </Badge>
                  )}
                  {b.rating_count < 10 && (
                    <Badge variant="info">Novo na plataforma</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <StarRating value={b.rating_avg} />
                  <span className="text-sm text-gray-500">
                    {b.rating_avg.toFixed(1)} ({b.rating_count} avaliações)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  Raio de atendimento: {b.service_radius_km} km
                </div>

                {b.instagram_url && (
                  <a
                    href={`https://instagram.com/${b.instagram_url.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-sm text-brand-600 hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    {b.instagram_url}
                  </a>
                )}

                {b.bio && (
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed">{b.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Serviços</h2>
            {activeServices.length === 0 ? (
              <p className="text-gray-400 text-sm">Nenhum serviço cadastrado ainda.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {activeServices.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
            {b.status === 'verified' && activeServices.length > 0 && (
              <div className="mt-6">
                <a
                  href={`/agendar/${b.id}`}
                  className="block w-full sm:w-auto sm:inline-block text-center rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
                >
                  Agendar com {p.full_name.split(' ')[0]}
                </a>
              </div>
            )}
          </div>

          {/* Avaliações */}
          <div className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Avaliações ({b.rating_count})
            </h2>
            {!reviewList.length ? (
              <p className="text-gray-400 text-sm">Ainda sem avaliações.</p>
            ) : (
              <div className="space-y-4">
                {reviewList.map((review) => (
                  <ReviewItem key={review.id} reviewId={review.reviewer_id} rating={review.rating} comment={review.comment} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

async function ReviewItem({
  reviewId,
  rating,
  comment,
}: {
  reviewId: string
  rating: number
  comment: string | null
}) {
  const supabase = createClient()
  const { data } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', reviewId).single()
  const reviewer = data as Pick<Profile, 'full_name' | 'avatar_url'> | null
  if (!reviewer) return null

  return (
    <div className="flex gap-3">
      <Avatar src={reviewer.avatar_url} name={reviewer.full_name} size="sm" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900">{reviewer.full_name}</span>
          <StarRating value={rating} size="sm" />
        </div>
        {comment && <p className="mt-1 text-sm text-gray-600">{comment}</p>}
      </div>
    </div>
  )
}
