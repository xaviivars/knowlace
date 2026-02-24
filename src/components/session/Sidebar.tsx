"use client"

type Participant = {
  id: string
  name: string
}

type SidebarProps = {
  sessionTitle: string
  participants: Participant[]
  joined: boolean
  isActive: boolean
  onLeave: () => void
}

export default function Sidebar({
  sessionTitle,
  participants,
  joined,
  isActive,
  onLeave
}: SidebarProps) {
  return (
    <div className="w-87.5 bg-[#142544] border-l border-white/10 p-6 flex flex-col">

      <div className="mb-6">
        <h2 className="text-xl font-semibold">{sessionTitle}</h2>
        <p className="text-sm text-white/60">
          {isActive ? "Sesión activa" : "Esperando inicio"}
        </p>
      </div>

    { /* mock */ }
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Leaderboard</h3>
        <div className="space-y-2 text-sm text-white/80">
          <div>🥇 Ana - 120 pts</div>
          <div>🥈 Juan - 95 pts</div>
          <div>🥉 Marta - 80 pts</div>
        </div>
      </div>

      <div className="mb-6 flex-1 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">
          Participantes ({participants.length})
        </h3>

        <div className="space-y-2 text-sm text-white/80">
          {participants.map((p) => (
            <div key={p.id} className="bg-white/5 px-3 py-2 rounded">
              {p.name}
            </div>
          ))}
        </div>
      </div>

      {joined && (
        <button
          onClick={onLeave}
          className="mt-auto bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded"
        >
          Salir
        </button>
      )}
    </div>
  )
}