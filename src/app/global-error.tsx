'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global] error:', error)
  }, [error])

  return (
    <html>
      <body style={{ fontFamily: 'monospace', padding: 40, background: '#fff' }}>
        <h1 style={{ color: '#dc2626' }}>Erro global — Blade Club</h1>
        <p style={{ color: '#374151', marginBottom: 16 }}>{error.message || 'Erro desconhecido'}</p>
        {error.digest && (
          <p style={{ color: '#6b7280', fontSize: 12 }}>Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          style={{ marginTop: 20, padding: '8px 16px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          Tentar novamente
        </button>
      </body>
    </html>
  )
}
