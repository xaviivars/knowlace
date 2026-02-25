"use client"

import dynamic from "next/dynamic"

const PdfViewer = dynamic(() => import("./PdfViewer"), {
  ssr: false,
})

type Props = {
  joined: boolean
  isActive: boolean
  name: string
  setName: (value: string) => void
  error: string | null
  onJoin: () => void
}

export default function PresentationArea({
  joined,
  isActive,
  name,
  setName,
  error,
  onJoin
}: Props) {

  // No unido
  if (!joined) {
    return (
      <div className="flex-1 bg-[#0b162c] flex items-center justify-center">
        <div className="bg-[#142544] p-10 rounded-2xl shadow-2xl w-100 text-center">
          <h2 className="text-2xl font-semibold mb-6">
            Unirse a la sesión
          </h2>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 mb-4"
          />

          <button
            onClick={onJoin}
            className="w-full bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded"
          >
            Unirse
          </button>

          {error && (
            <div className="text-red-400 text-sm mt-4">
              {error}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Unido pero esperando inicio
  if (joined && !isActive) {
    return (
      <div className="flex-1 bg-[#0b162c] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Esperando al profesor...
          </h2>
          <p className="text-white/60">
            La sesión comenzará en breve.
          </p>
        </div>
      </div>
    )
  }

  // Sesión activa → Mostrar PDF
  return (
    <div className="flex-1 bg-[#0b162c]">
      <PdfViewer />
    </div>
  )
}