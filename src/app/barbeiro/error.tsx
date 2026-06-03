'use client'

import { useEffect } from 'react'

export default function BarbeiroError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[barbeiro] error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-8">
      <h2 className="text-xl font-bold text-red-600">Erro no painel</h2>
      <pre className="text-xs bg-red-50 border border-red-200 rounded p-4 max-w-xl overflow-auto text-red-800">
        {error.message || 'Erro desconhecido'}
        {error.digest ? `\nDigest: ${error.digest}` : ''}
      </pre>
      <button
        onClick={reset}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700"
      >
        Tentar novamente
      </button>
    </div>
  )
}
