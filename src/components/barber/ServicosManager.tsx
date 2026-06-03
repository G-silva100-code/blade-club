'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Card, CardBody } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { MIN_PRICES, SERVICE_LABELS } from '@/lib/constants'
import type { BarberService } from '@/types'

type ServiceType = 'haircut' | 'beard' | 'combo' | 'treatment'

const SERVICE_TYPES: ServiceType[] = ['haircut', 'beard', 'combo', 'treatment']

interface ServicosManagerProps {
  initialServices: BarberService[]
}

interface ServiceForm {
  service_type: ServiceType
  name: string
  price: string
  duration_minutes: string
}

const DEFAULT_FORM: ServiceForm = {
  service_type:     'haircut',
  name:             '',
  price:            '',
  duration_minutes: '60',
}

export function ServicosManager({ initialServices }: ServicosManagerProps) {
  const [services, setServices]   = useState<BarberService[]>(initialServices)
  const [open, setOpen]           = useState(false)
  const [editing, setEditing]     = useState<BarberService | null>(null)
  const [form, setForm]           = useState<ServiceForm>(DEFAULT_FORM)
  const [saving, setSaving]       = useState(false)
  const [deleting, setDeleting]   = useState<string | null>(null)
  const [error, setError]         = useState('')

  function openNew() {
    setEditing(null)
    setForm(DEFAULT_FORM)
    setError('')
    setOpen(true)
  }

  function openEdit(service: BarberService) {
    setEditing(service)
    setForm({
      service_type:     service.service_type as ServiceType,
      name:             service.name,
      price:            String(service.price),
      duration_minutes: String(service.duration_minutes ?? 60),
    })
    setError('')
    setOpen(true)
  }

  async function handleSave() {
    const price = Number(form.price)
    const min   = MIN_PRICES[form.service_type] ?? 0
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    if (isNaN(price) || price < min) {
      setError(`Preço mínimo para ${SERVICE_LABELS[form.service_type]}: ${formatCurrency(min)}`)
      return
    }

    setSaving(true)
    setError('')

    const body = {
      service_type:     form.service_type,
      name:             form.name.trim(),
      price,
      duration_minutes: Number(form.duration_minutes) || 60,
    }

    const res = editing
      ? await fetch(`/api/barbeiro/services/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      : await fetch('/api/barbeiro/services',               { method: 'POST',  headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

    const data = await res.json()
    setSaving(false)

    if (!res.ok) { setError(data.error ?? 'Erro ao salvar.'); return }

    setServices((prev) =>
      editing
        ? prev.map((s) => s.id === editing.id ? data : s)
        : [...prev, data]
    )
    setOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Remover este serviço?')) return
    setDeleting(id)
    await fetch(`/api/barbeiro/services/${id}`, { method: 'DELETE' })
    setServices((prev) => prev.filter((s) => s.id !== id))
    setDeleting(null)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meus Serviços</h1>
          <p className="text-sm text-gray-500 mt-1">
            Preços mínimos: Corte R$80 · Barba R$70 · Combo R$130 · Tratamento R$120
          </p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> Adicionar serviço
        </button>
      </div>

      {!services.length ? (
        <Card>
          <CardBody className="text-center py-12 text-gray-400">
            <p>Nenhum serviço cadastrado ainda.</p>
            <p className="text-sm mt-1">Adicione seus serviços para aparecer nas buscas.</p>
            <button
              onClick={openNew}
              className="mt-4 inline-flex items-center gap-2 rounded-full border-2 border-brand-500 px-5 py-2.5 text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
            >
              <Plus className="h-4 w-4" /> Adicionar primeiro serviço
            </button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-2xl ring-1 ring-gray-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{service.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{SERVICE_LABELS[service.service_type]} · {service.duration_minutes} min</p>
                  <p className="text-xl font-bold text-brand-600 mt-2">{formatCurrency(service.price)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(service)}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    disabled={deleting === service.id}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deleting === service.id
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />
                    }
                  </button>
                </div>
              </div>
              {!service.active && (
                <p className="mt-2 text-xs text-gray-400 italic">Inativo</p>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar serviço' : 'Novo serviço'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Tipo de serviço</label>
            <select
              value={form.service_type}
              onChange={(e) => setForm({ ...form, service_type: e.target.value as ServiceType })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>{SERVICE_LABELS[t]}</option>
              ))}
            </select>
          </div>

          <Input
            label="Nome do serviço"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder={`Ex: ${SERVICE_LABELS[form.service_type]} clássico`}
          />

          <Input
            label={`Preço (R$) — mínimo ${formatCurrency(MIN_PRICES[form.service_type])}`}
            type="number"
            min={MIN_PRICES[form.service_type]}
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="0,00"
          />

          <Input
            label="Duração (minutos)"
            type="number"
            min={15}
            max={240}
            step={15}
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: e.target.value })}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setOpen(false)}
              className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 rounded-full bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? 'Salvar alterações' : 'Adicionar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
