'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { StepService }  from './StepService'
import { StepAddress }  from './StepAddress'
import { StepSlot }     from './StepSlot'
import { StepConfirm }  from './StepConfirm'
import { calculateCheckout } from '@/lib/utils'
import type { BarberService, TimeSlot } from '@/types'

interface BarberInfo {
  id:         string
  name:       string
  rating_avg: number
  base_lat:   number
  base_lng:   number
}

interface BookingFlowProps {
  barber:   BarberInfo
  services: BarberService[]
}

type Step = 1 | 2 | 3 | 4 | 'success'

interface LocationState {
  lat:         number
  lng:         number
  address:     string
  distance_km: number
  travel_fee:  number
}

const STEP_LABELS = ['Serviço', 'Endereço', 'Horário', 'Confirmar']

export function BookingFlow({ barber, services }: BookingFlowProps) {
  const [step, setStep]         = useState<Step>(1)
  const [service, setService]   = useState<BarberService | null>(null)
  const [location, setLocation] = useState<LocationState | null>(null)
  const [slot, setSlot]         = useState<TimeSlot | null>(null)
  const router                  = useRouter()

  async function handleConfirm() {
    if (!service || !location || !slot) return

    const breakdown = calculateCheckout(service.price, location.distance_km)

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        barber_id:       barber.id,
        service_id:      service.id,
        address:         location.address,
        lat:             location.lat,
        lng:             location.lng,
        distance_km:     location.distance_km,
        suggested_times: [slot.startISO],
        ...breakdown,
      }),
    })

    if (res.ok) setStep('success')
  }

  if (step === 'success') {
    return (
      <div className="text-center py-16 space-y-6">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-50">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Solicitação enviada!</h2>
          <p className="text-gray-500 max-w-sm mx-auto">
            {barber.name} receberá uma notificação e confirmará em breve.
            Você será notificado assim que ele aceitar.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/cliente/agendamentos')}
            className="rounded-full bg-gray-900 px-8 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-colors"
          >
            Ver meus agendamentos
          </button>
          <button
            onClick={() => router.push('/buscar')}
            className="rounded-full border border-gray-200 px-8 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Buscar outro barbeiro
          </button>
        </div>
      </div>
    )
  }

  const currentStep = step as 1 | 2 | 3 | 4

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEP_LABELS.map((label, i) => {
            const s = (i + 1) as 1 | 2 | 3 | 4
            return (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  currentStep > s  ? 'bg-green-500 text-white' :
                  currentStep === s ? 'bg-gray-900 text-white' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > s ? '✓' : s}
                </div>
                <span className={`text-[10px] hidden sm:block ${currentStep === s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
            )
          })}
        </div>
        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      {step === 1 && (
        <StepService
          services={services}
          selected={service}
          onSelect={setService}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <StepAddress
          barberLat={barber.base_lat}
          barberLng={barber.base_lng}
          onConfirm={loc => { setLocation(loc); setStep(3) }}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && service && location && (
        <StepSlot
          barberId={barber.id}
          serviceType={service.service_type}
          clientLat={location.lat}
          clientLng={location.lng}
          selected={slot}
          onSelect={setSlot}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && service && location && slot && (
        <StepConfirm
          barberName={barber.name}
          barberRating={barber.rating_avg}
          service={service}
          address={location.address}
          distanceKm={location.distance_km}
          travelFee={location.travel_fee}
          slot={slot}
          onConfirm={handleConfirm}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
