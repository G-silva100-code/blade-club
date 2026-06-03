'use client'

import { useEffect, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

export function SettingsForm() {
  const [bufferMin, setBufferMin]           = useState(15)
  const [radiusKm, setRadiusKm]             = useState(10)
  const [baseAddress, setBaseAddress]       = useState('')
  const [loading, setLoading]               = useState(true)
  const [saving, setSaving]                 = useState(false)
  const [saved, setSaved]                   = useState(false)

  useEffect(() => {
    fetch('/api/barbeiro/settings')
      .then(r => r.json())
      .then(data => {
        setBufferMin(data.buffer_minutes    ?? 15)
        setRadiusKm(data.service_radius_km ?? 10)
        setBaseAddress(data.base_address   ?? '')
        setLoading(false)
      })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    await fetch('/api/barbeiro/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        buffer_minutes:    bufferMin,
        service_radius_km: radiusKm,
        base_address:      baseAddress,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blade-muted py-8">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Buffer */}
      <div>
        <label className="block text-sm font-semibold text-blade-text mb-3">
          Buffer entre atendimentos
        </label>
        <p className="text-xs text-blade-muted mb-4">
          Tempo de descanso ou deslocamento reservado automaticamente após cada serviço.
        </p>
        <div className="flex gap-3">
          {[15, 30].map(v => (
            <button
              key={v}
              type="button"
              onClick={() => setBufferMin(v)}
              className={`flex-1 rounded-xl border py-3 text-sm font-medium transition-colors ${
                bufferMin === v
                  ? 'border-gold bg-gold/10 text-gold'
                  : 'border-blade-border text-blade-muted hover:border-gold'
              }`}
            >
              {v} minutos
            </button>
          ))}
        </div>
      </div>

      {/* Raio */}
      <div>
        <label className="block text-sm font-semibold text-blade-text mb-1">
          Raio máximo de atendimento: <span className="text-gold">{radiusKm} km</span>
        </label>
        <p className="text-xs text-blade-muted mb-3">
          Clientes fora desse raio (a partir do seu endereço base) não verão você nas buscas.
        </p>
        <input
          type="range"
          min={2}
          max={30}
          value={radiusKm}
          onChange={e => setRadiusKm(Number(e.target.value))}
          className="w-full accent-gold"
        />
        <div className="flex justify-between text-xs text-blade-muted mt-1">
          <span>2 km</span><span>30 km</span>
        </div>
      </div>

      {/* Endereço base */}
      <div>
        <label className="block text-sm font-semibold text-blade-text mb-1">
          Endereço base de saída
        </label>
        <p className="text-xs text-blade-muted mb-3">
          Usado para calcular o tempo de deslocamento até o primeiro cliente do dia.
        </p>
        <input
          type="text"
          value={baseAddress}
          onChange={e => setBaseAddress(e.target.value)}
          placeholder="Ex: Rua XV de Novembro, 1000, Centro, Curitiba/PR"
          className="w-full rounded-xl border border-blade-border bg-blade-bg px-4 py-2.5 text-sm text-blade-text placeholder:text-blade-muted focus:outline-none focus:border-gold"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-semibold text-blade-bg hover:bg-gold-light disabled:opacity-60 transition-colors"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Salvar configurações
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-400">
            <Check className="h-4 w-4" /> Salvo!
          </span>
        )}
      </div>
    </div>
  )
}
