'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BookingWithDetails } from '@/types'

export function useBookings(role: 'client' | 'barber') {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/bookings?role=${role}`)
    const data = await res.json()
    setBookings(data)
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load() }, [role])

  async function acceptBooking(bookingId: string, scheduledAt: string) {
    await fetch(`/api/bookings/${bookingId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at: scheduledAt }),
    })
    await load()
  }

  async function cancelBooking(bookingId: string) {
    await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' })
    await load()
  }

  async function checkin(bookingId: string) {
    await fetch(`/api/bookings/${bookingId}/checkin`, { method: 'POST' })
    await load()
  }

  async function checkout(bookingId: string) {
    await fetch(`/api/bookings/${bookingId}/checkout`, { method: 'POST' })
    await load()
  }

  return { bookings, loading, acceptBooking, cancelBooking, checkin, checkout, refresh: load }
}
