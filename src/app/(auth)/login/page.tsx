'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError || !data.user) {
      setError('Email ou senha incorretos.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('type')
      .eq('id', data.user.id)
      .single()

    const type = (profile as { type: string } | null)?.type
    const dest = type === 'barber' ? '/barbeiro/dashboard'
               : type === 'admin'  ? '/admin/barbeiros'
               : '/cliente/dashboard'

    window.location.href = dest
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link href="/" style={{ color: '#C9A84C', fontSize: '20px', fontWeight: 'bold', letterSpacing: '0.2em', textDecoration: 'none' }}>
            BLADE CLUB
          </Link>
          <p style={{ marginTop: '8px', color: '#888' }}>Acesse sua conta</p>
        </div>

        <form onSubmit={handleLogin} style={{ background: 'white', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px', color: '#374151' }}>Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: '#C9A84C', color: 'white', border: 'none', borderRadius: '999px', padding: '14px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
            Não tem conta?{' '}
            <Link href="/cadastro/cliente" style={{ color: '#C9A84C', fontWeight: '500' }}>Criar como cliente</Link>
            {' '}ou{' '}
            <Link href="/cadastro/barbeiro" style={{ color: '#C9A84C', fontWeight: '500' }}>como barbeiro</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
