'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error capturado:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white p-4">
      <div className="max-w-md w-full bg-[#111118] rounded-lg p-6 border border-gray-800">
        <h2 className="text-xl font-bold text-red-400 mb-4">Error en la aplicación</h2>
        <div className="bg-red-500/10 border border-red-500/20 rounded p-3 mb-4">
          <p className="text-sm font-mono text-red-300 break-all">{error.message}</p>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Por favor, intenta recargar la página. Si el problema persiste, contacta al soporte.
        </p>
        <button
          onClick={() => reset()}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}
