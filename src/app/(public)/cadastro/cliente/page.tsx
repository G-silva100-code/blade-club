'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Scissors } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function CadastroClientePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      type: 'client',
      full_name: form.name,
      phone: form.phone,
    })

    await supabase.from('clients').insert({ id: data.user.id })

    router.push('/cliente/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl">
            <Scissors className="h-6 w-6 text-brand-400" />
            BarberApp
          </Link>
          <p className="mt-3 text-gray-400">Crie sua conta de cliente</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 space-y-5 shadow-xl">
          <Input label="Nome completo" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          <Input label="Telefone (WhatsApp)" type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="(41) 99999-0000" />
          <Input label="Senha" type="password" value={form.password} onChange={(e) => set('password', e.target.value)} required />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Criar conta
          </Button>

          <p className="text-center text-sm text-gray-500">
            Já tem conta?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>

          <p className="text-xs text-gray-400 text-center">
            Ao criar conta você concorda com nossos{' '}
            <Link href="/termos" className="underline">Termos de uso</Link> e{' '}
            <Link href="/privacidade" className="underline">Política de privacidade</Link>.
          </p>
        </form>
      </div>
    </div>
  )
}
