import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Barber = Database['public']['Tables']['barbers']['Row']
export type BarberService = Database['public']['Tables']['barber_services']['Row']
export type Client = Database['public']['Tables']['clients']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type BookingTimeSuggestion = Database['public']['Tables']['booking_time_suggestions']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type BypassFlag = Database['public']['Tables']['bypass_flags']['Row']

export type ServiceType = 'haircut' | 'beard' | 'combo' | 'treatment'
export type BarberStatus = 'pending' | 'verified' | 'suspended' | 'banned'
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'cancelled'
  | 'no_show_client'
  | 'no_show_barber'
export type UserType = 'client' | 'barber' | 'admin'

export interface BarberWithProfile extends Barber {
  profiles: Profile
  barber_services: BarberService[]
}

export interface BookingWithDetails extends Booking {
  barbers: BarberWithProfile
  clients: Client & { profiles: Profile }
  barber_services: BarberService
  booking_time_suggestions: BookingTimeSuggestion[]
}

export interface TravelFeeCalc {
  distance_km: number
  travel_fee: number
}

export interface CheckoutBreakdown {
  service_price: number
  travel_fee: number
  total_amount: number
  platform_fee: number
  barber_payout: number
}

// ── Agenda / Disponibilidade ─────────────────────────────────────────────

export interface BarberAvailability {
  id: string
  barber_id: string
  day_of_week: number  // 0=Dom … 6=Sab
  start_time: string   // "HH:MM:SS"
  end_time: string     // "HH:MM:SS"
  active: boolean
}

export interface BarberBlockedDate {
  id: string
  barber_id: string
  blocked_date: string  // "YYYY-MM-DD"
  reason: string | null
}

export interface BarberServiceDuration {
  id: string
  barber_id: string
  service_type: ServiceType
  duration_minutes: number
}

export interface TimeSlot {
  start: string        // "HH:MM"
  startISO: string     // "YYYY-MM-DDTHH:MM:00"
  end: string          // "HH:MM"
  travel_minutes: number
}

export const DEFAULT_DURATIONS: Record<ServiceType, number> = {
  haircut:   45,
  beard:     30,
  combo:     70,
  treatment: 60,
}

export const DAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado',
}

export const DAY_SHORT: Record<number, string> = {
  0: 'Dom', 1: 'Seg', 2: 'Ter', 3: 'Qua', 4: 'Qui', 5: 'Sex', 6: 'Sáb',
}
