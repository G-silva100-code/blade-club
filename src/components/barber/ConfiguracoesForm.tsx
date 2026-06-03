'use client'

import { useState } from 'react'
import { Loader2, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { SERVICE_RADIUS } from '@/lib/constants'
import type { Barber, Profile } from '@/types'

interface ConfiguracoesFormProps {
  profile: Profile | null
  barber:  Barber  | null
}

export function ConfiguracoesForm({ profile, barber }: ConfiguracoesFormProps) {
  const [form, setForm] = useState({
    full_name:         profile?.full_name        ?? '',
    phone:             profile?.phone            ?? '',
    bio:               barber?.bio               ?? '',
    instagram_url:     barber?.instagram_url     ?? '',
    base_address:      barber?.base_address      ?? '',
    service_radius_km: String(barber?.service_radius_km ?? 10),
  })
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setSuccess(false)
  }

  async function handleSave() {
    const radius = Number(form.service_radius_km)
    if (radius < SERVICE_RADIUS.MIN_KM || radius > SERVICE_RADIUS.MAX_KM) {
      setError(`Raio deve estar entre ${SERVICE_RADIUS.MIN_KM} e ${SERVICE_RADIUS.MAX_KM} km.`)
      return
    }
    setSaving(true)
    setError('')

    const res = await fetch('/api/barbeiro/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name:         form.full_name.trim(),
        phone:             form.phone.trim(),
        bio:               form.bio.trim(),
        instagram_url:     form.instagram_url.trim(),
        base_address:      form.base_address.trim(),
        service_radius_km: radius,
      }),
    })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return }
    setSuccess(true)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Perfil */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Perfil público</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Nome completo"
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
          />
          <Input
            label="Telefone / WhatsApp"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="(41) 99999-9999"
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value)}
              rows={3}
              maxLength={300}
              placeholder="Fale um pouco sobre você e sua especialidade..."
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{form.bio.length}/300</p>
          </div>
          <Input
            label="Instagram (só o @ ou link)"
            value={form.instagram_url}
            onChange={(e) => set('instagram_url', e.target.value)}
            placeholder="@seuperfil"
          />
        </CardBody>
      </Card>

      {/* Localização */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Localização e raio de atendimento</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <Input
            label="Endereço base (bairro ou endereço completo)"
            value={form.base_address}
            onChange={(e) => set('base_address', e.target.value)}
            placeholder="Ex: Batel, Curitiba - PR"
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Raio de atendimento: <span className="text-brand-600 font-bold">{form.service_radius_km} km</span>
            </label>
            <input
              type="range"
              min={SERVICE_RADIUS.MIN_KM}
              max={SERVICE_RADIUS.MAX_KM}
              step={1}
              value={form.service_radius_km}
              onChange={(e) => set('service_radius_km', e.target.value)}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{SERVICE_RADIUS.MIN_KM} km</span>
              <span>{SERVICE_RADIUS.MAX_KM} km</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Clientes fora desse raio não conseguirão agendar com você.
            Primeiros 3 km grátis; R$2/km adicional pago pelo cliente.
          </p>
        </CardBody>
      </Card>

      {error   && <p className="text-sm text-red-500">{error}</p>}
      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <CheckCircle className="h-4 w-4" /> Configurações salvas com sucesso.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition-colors"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Salvar configurações
      </button>
    </div>
  )
}
