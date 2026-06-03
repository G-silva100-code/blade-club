'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [userType, setUserType] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    import('@/lib/supabase/client').then(({ createClient }) => {
      const supabase = createClient()
      supabase.auth.getUser().then(async ({ data }) => {
        setUser(data.user)
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('type')
            .eq('id', data.user.id)
            .single()
          setUserType((profile as { type: string } | null)?.type ?? null)
        }
      })
      const { data: listener } = supabase.auth.onAuthStateChange(async (_, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('type')
            .eq('id', session.user.id)
            .single()
          setUserType((profile as { type: string } | null)?.type ?? null)
        } else {
          setUserType(null)
        }
      })
      return () => listener.subscription.unsubscribe()
    })
  }, [])

  const dashboardHref =
    userType === 'barber' ? '/barbeiro/dashboard' :
    userType === 'admin'  ? '/admin/barbeiros' :
    '/cliente/dashboard'

  return (
    <header className="sticky top-0 z-40 bg-blade-bg/95 backdrop-blur border-b border-blade-border">
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image src="/logo.svg" alt="Blade Club" width={120} height={38} priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-blade-muted">
          <Link href="#como-funciona" className="hover:text-blade-text transition-colors">
            Como funciona
          </Link>
          <Link href="/barbeiros" className="hover:text-blade-text transition-colors">
            Trabalhe conosco
          </Link>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link
              href={dashboardHref}
              className="rounded-full border border-blade-border px-5 py-2 text-sm font-medium text-blade-text hover:border-gold hover:text-gold transition-colors"
            >
              Minha conta
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-blade-muted hover:text-blade-text transition-colors">
                Entrar
              </Link>
              <Link
                href="/buscar"
                className="rounded-full bg-gold px-5 py-2 text-sm font-semibold text-blade-bg hover:bg-gold-light transition-colors"
              >
                Agendar
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-blade-text"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-blade-bg border-t border-blade-border px-6 py-5 space-y-4">
          <Link href="#como-funciona" className="block text-blade-muted py-2" onClick={() => setMenuOpen(false)}>Como funciona</Link>
          <Link href="/barbeiros" className="block text-blade-muted py-2" onClick={() => setMenuOpen(false)}>Trabalhe conosco</Link>
          <div className="pt-3 flex flex-col gap-3">
            {user ? (
              <Link href={dashboardHref} className="block text-center rounded-full bg-gold py-2.5 text-sm font-semibold text-blade-bg">
                Minha conta
              </Link>
            ) : (
              <>
                <Link href="/login" className="block text-center text-blade-muted py-2">Entrar</Link>
                <Link href="/buscar" className="block text-center rounded-full bg-gold py-2.5 text-sm font-semibold text-blade-bg">
                  Agendar agora
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
