'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors, CheckCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function CadastroBarbeiroPage() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', password: '',
    bio: '', instagram: '', serviceRadius: '10',
    acceptedTerms: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.acceptedTerms) {
      setError('Você precisa aceitar os termos para continuar.')
      return
    }

    setLoading(true)
    setError(null)

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError || !data.user) {
      setError(signUpError?.message ?? 'Erro ao criar conta.')
      setLoading(false)
      return
    }

    await supabase.from('profiles').insert({
      id: data.user.id,
      type: 'barber',
      full_name: form.name,
      cpf: form.cpf.replace(/\D/g, ''),
      phone: form.phone,
    })

    await supabase.from('barbers').insert({
      id: data.user.id,
      bio: form.bio,
      instagram_url: form.instagram,
      status: 'pending',
      service_radius_km: Number(form.serviceRadius),
    })

    router.push('/barbeiro/dashboard?cadastro=pendente')
  }

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl">
            <Scissors className="h-6 w-6 text-brand-400" />
            BarberApp
          </Link>
          <p className="mt-3 text-gray-400">Cadastro de barbeiro profissional</p>

          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-2 rounded-full transition-all ${step >= s ? 'bg-brand-500 w-8' : 'bg-gray-700 w-4'}`} />
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5 shadow-xl">
          {step === 1 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Dados pessoais</h2>
              <Input label="Nome completo" value={form.name} onChange={(e) => set('name', e.target.value)} required />
              <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
              <Input label="Telefone (WhatsApp)" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(41) 99999-0000" required />
              <Input label="CPF" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" required />
              <Input label="Senha" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required />
              <Button type="button" className="w-full" size="lg" onClick={() => setStep(2)}>
                Continuar
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Perfil profissional</h2>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Sobre você</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => set('bio', e.target.value)}
                  placeholder="Fale sobre sua experiência, especialidades..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <Input label="Instagram (opcional)" value={form.instagram} onChange={(e) => set('instagram', e.target.value)} placeholder="@seuinstagram" />
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Raio de atendimento: <span className="text-brand-600 font-semibold">{form.serviceRadius} km</span>
                </label>
                <input
                  type="range"
                  min="2" max="30"
                  value={form.serviceRadius}
                  onChange={(e) => set('serviceRadius', e.target.value)}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>2 km</span><span>30 km</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setStep(1)}>Voltar</Button>
                <Button type="button" size="lg" className="flex-1" onClick={() => setStep(3)}>Continuar</Button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-semibold text-gray-900">Termos e contrato</h2>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2 max-h-48 overflow-y-auto">
                <p className="font-medium">Ao se cadastrar como barbeiro você concorda com:</p>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li>Comissão de 20% sobre o valor dos serviços</li>
                  <li>Multa de R$500 por atendimento comprovado fora da plataforma</li>
                  <li>Suspensão em caso de 3 no-shows consecutivos</li>
                  <li>Exclusão permanente em caso de reincidência de bypass</li>
                  <li>Cláusula de não-concorrência de 12 meses para clientes originados pela plataforma</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.acceptedTerms}
                  onChange={(e) => set('acceptedTerms', e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-brand-500"
                />
                <span className="text-sm text-gray-700">
                  Li e aceito os{' '}
                  <Link href="/termos" className="text-brand-600 underline" target="_blank">termos de uso</Link>,{' '}
                  <Link href="/privacidade" className="text-brand-600 underline" target="_blank">política de privacidade</Link>{' '}
                  e o contrato de adesão ao marketplace.
                </span>
              </label>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-3">
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => setStep(2)}>Voltar</Button>
                <Button type="submit" size="lg" className="flex-1" loading={loading}>Cadastrar</Button>
              </div>

              <div className="mt-2 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                Seu cadastro será analisado em até 48h. Você receberá um email de confirmação.
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
