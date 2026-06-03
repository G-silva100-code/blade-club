'use client'

import { useState } from 'react'
import { MapPin, Loader2, Navigation, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { haversineKm } from '@/lib/maps/geocode'
import { TRAVEL } from '@/lib/constants'

interface LocationResult {
  lat:        number
  lng:        number
  address:    string
  distance_km: number
  travel_fee: number
  approximate?: boolean
}

interface Props {
  barberLat:  number
  barberLng:  number
  onConfirm:  (result: LocationResult) => void
  onBack:     () => void
}

function calcTravelFee(km: number): number {
  return km <= TRAVEL.FREE_KM ? 0 : Math.round((km - TRAVEL.FREE_KM) * TRAVEL.FEE_PER_KM * 100) / 100
}

export function StepAddress({ barberLat, barberLng, onConfirm, onBack }: Props) {
  const [address, setAddress]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [locating, setLocating] = useState(false)
  const [result, setResult]     = useState<LocationResult | null>(null)
  const [error, setError]       = useState<string | null>(null)

  async function handleGeocode() {
    if (!address.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    const res  = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`)
    const data = await res.json()

    const km  = haversineKm(barberLat, barberLng, data.lat, data.lng)
    const fee = calcTravelFee(km)

    setResult({
      lat:         data.lat,
      lng:         data.lng,
      address:     data.formatted,
      distance_km: km,
      travel_fee:  fee,
      approximate: data.approximate,
    })
    setLoading(false)
  }

  function handleGeolocation() {
    if (!navigator.geolocation) {
      setError('Geolocalização não disponível no seu navegador.')
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords
        const km  = haversineKm(barberLat, barberLng, lat, lng)
        const fee = calcTravelFee(km)
        setResult({
          lat, lng,
          address:     'Sua localização atual',
          distance_km: km,
          travel_fee:  fee,
        })
        setLocating(false)
      },
      () => {
        setError('Não foi possível obter sua localização. Tente digitar o endereço.')
        setLocating(false)
      }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Onde você quer ser atendido?</h2>
        <p className="text-sm text-gray-500">Casa, escritório, hotel — onde for mais cômodo</p>
      </div>

      {/* Geolocation button */}
      <button
        onClick={handleGeolocation}
        disabled={locating}
        className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 p-4 hover:border-amber-400 hover:bg-amber-50/30 transition-colors"
      >
        {locating
          ? <Loader2 className="h-5 w-5 text-amber-500 animate-spin" />
          : <Navigation className="h-5 w-5 text-amber-500" />
        }
        <span className="text-sm font-medium text-gray-700">
          {locating ? 'Obtendo localização...' : 'Usar minha localização atual'}
        </span>
      </button>

      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="flex-1 h-px bg-gray-100" />
        ou
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Address input */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={e => setAddress(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGeocode()}
            placeholder="Rua, número, bairro — Curitiba/PR"
            className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleGeocode}
            disabled={loading || !address.trim()}
            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Result card */}
      {result && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">{result.address}</p>
              {result.approximate && (
                <p className="text-xs text-amber-600 mt-0.5">
                  Localização aproximada — configure a chave Google Maps para precisão exata.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-between text-sm border-t border-amber-100 pt-3">
            <span className="text-gray-500">Distância estimada</span>
            <span className="font-medium">{result.distance_km.toFixed(1)} km</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Taxa de deslocamento</span>
            <span className="font-semibold text-gray-900">
              {result.travel_fee === 0 ? 'Grátis' : formatCurrency(result.travel_fee)}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
        <button
          onClick={() => result && onConfirm(result)}
          disabled={!result}
          className="flex-1 rounded-full bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-40 transition-colors"
        >
          Confirmar endereço
        </button>
      </div>
    </div>
  )
}
