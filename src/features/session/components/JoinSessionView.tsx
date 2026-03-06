"use client"

type Props = {
  name: string
  setName: (value: string) => void
  error: string | null
  onJoin: () => void
}

export default function JoinSessionView({
  name,
  setName,
  error,
  onJoin
}: Props) {

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