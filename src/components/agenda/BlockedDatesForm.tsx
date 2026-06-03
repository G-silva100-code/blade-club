'use client'

import { useEffect, useState } from 'react'
import { X, Plus, Loader2, CalendarX } from 'lucide-react'
import type { BarberBlockedDate } from '@/types'

export function BlockedDatesForm() {
  const [dates, setDates]     = useState<BarberBlockedDate[]>([])
  const [newDate, setNewDate] = useState('')
  const [reason, setReason]   = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding]   = useState(false)

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const r = await fetch('/api/barbeiro/blocked-dates')
    setDates(await r.json())
    setLoading(false)
  }

  async function handleAdd() {
    if (!newDate) return
    setAdding(true)
    await fetch('/api/barbeiro/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocked_date: newDate, reason }),
    })
    setNewDate('')
    setReason('')
    await load()
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/barbeiro/blocked-dates?id=${id}`, { method: 'DELETE' })
    setDates(prev => prev.filter(d => d.id !== id))
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long',
    })
  }

  return (
    <div className="space-y-6">
      {/* Adicionar */}
      <div className="bg-blade-card border border-blade-border rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-blade-text uppercase tracking-wider">Bloquear data</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-blade-muted">Data</label>
            <input
              type="date"
              min={today}
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              className="rounded-lg border border-blade-border bg-blade-bg px-3 py-2 text-sm text-blade-text focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-48">
            <label className="text-xs text-blade-muted">Motivo (opcional)</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Ex: Folga, Feriado, Viagem..."
              className="rounded-lg border border-blade-border bg-blade-bg px-3 py-2 text-sm text-blade-text placeholder:text-blade-muted focus:outline-none focus:border-gold"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAdd}
              disabled={!newDate || adding}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-2 text-sm font-semibold text-blade-bg hover:bg-gold-light disabled:opacity-50 transition-colors"
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center gap-2 text-blade-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : dates.length === 0 ? (
        <div className="text-center py-10 text-blade-muted">
          <CalendarX className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma data bloqueada.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dates.map(d => (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-xl border border-blade-border bg-blade-card px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-blade-text capitalize">{formatDate(d.blocked_date)}</p>
                {d.reason && <p className="text-xs text-blade-muted mt-0.5">{d.reason}</p>}
              </div>
              <button
                onClick={() => handleDelete(d.id)}
                className="text-blade-muted hover:text-red-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
