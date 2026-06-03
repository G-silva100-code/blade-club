import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { TRAVEL, PLATFORM_COMMISSION, BYPASS_PATTERNS } from './constants'
import type { CheckoutBreakdown } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function calculateTravelFee(distanceKm: number): number {
  if (distanceKm <= TRAVEL.FREE_KM) return 0
  return (distanceKm - TRAVEL.FREE_KM) * TRAVEL.FEE_PER_KM
}

export function calculateCheckout(
  servicePrice: number,
  distanceKm: number
): CheckoutBreakdown {
  const travel_fee = calculateTravelFee(distanceKm)
  const total_amount = servicePrice + travel_fee
  const platform_fee = Math.round(servicePrice * PLATFORM_COMMISSION * 100) / 100
  const barber_payout = servicePrice - platform_fee + travel_fee

  return {
    service_price: servicePrice,
    travel_fee,
    total_amount,
    platform_fee,
    barber_payout,
  }
}

export function isMessageBlocked(content: string): boolean {
  return BYPASS_PATTERNS.some((pattern) => pattern.test(content))
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatDateShort(dateStr: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(dateStr))
}

export function hoursUntil(dateStr: string): number {
  return (new Date(dateStr).getTime() - Date.now()) / 3_600_000
}

export function maskCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '')
}
