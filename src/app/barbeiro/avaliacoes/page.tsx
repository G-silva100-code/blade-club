import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardBody } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { StarRating } from '@/components/ui/StarRating'
import { formatDateShort } from '@/lib/utils'
import { Star } from 'lucide-react'
import type { Profile, Review } from '@/types'

interface ReviewRow extends Review {
  profiles: Pick<Profile, 'full_name' | 'avatar_url'>
}

export default async function AvaliacoesPage() {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const userId = session.user.id

  const [barberResult, reviewsResult] = await Promise.all([
    supabase.from('barbers').select('rating_avg, rating_count').eq('id', userId).single(),
    supabase
      .from('reviews')
      .select('*, profiles:reviewer_id(full_name, avatar_url)')
      .eq('reviewed_id', userId)
      .order('created_at', { ascending: false }),
  ])

  const barber  = barberResult.data  as { rating_avg: number; rating_count: number } | null
  const reviews = (reviewsResult.data as ReviewRow[] | null) ?? []

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>

      {/* Resumo */}
      <Card>
        <CardBody>
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="text-center">
              <p className="text-5xl font-bold text-gray-900">
                {barber?.rating_avg ? barber.rating_avg.toFixed(1) : '—'}
              </p>
              <StarRating value={barber?.rating_avg ?? 0} />
              <p className="text-sm text-gray-400 mt-1">{barber?.rating_count ?? 0} avaliações</p>
            </div>

            <div className="flex-1 w-full space-y-1.5">
              {distribution.map(({ star, count }) => {
                const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <span className="w-4 text-gray-500 text-right">{star}</span>
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-8 text-gray-400 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista */}
      {!reviews.length ? (
        <Card>
          <CardBody className="text-center py-12 text-gray-400">
            <Star className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p>Nenhuma avaliação ainda.</p>
            <p className="text-sm mt-1">As avaliações aparecem após cada atendimento concluído.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardBody>
                <div className="flex gap-4">
                  <Avatar
                    src={review.profiles?.avatar_url ?? null}
                    name={review.profiles?.full_name ?? 'Cliente'}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">
                        {review.profiles?.full_name ?? 'Cliente'}
                      </p>
                      <p className="text-xs text-gray-400">{formatDateShort(review.created_at)}</p>
                    </div>
                    <StarRating value={review.rating} size="sm" />
                    {review.comment && (
                      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                    )}
                    {review.portfolio_photo_url && (
                      <img
                        src={review.portfolio_photo_url}
                        alt="Foto do resultado"
                        className="mt-3 rounded-xl max-h-48 object-cover"
                      />
                    )}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
