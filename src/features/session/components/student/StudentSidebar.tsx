"use client"

type Participant = {
  id: string
  name: string
  score?: number
}

type SidebarProps = {
  sessionTitle: string
  participants: Participant[]
  leaderboard: Participant[]
  joined: boolean
  isActive: boolean
  onLeave: () => void
}

export default function StudentSidebar({
  sessionTitle,
  participants,
  leaderboard,
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

        <h4 className="text-m mt-3">
          Participantes conectados: {participants.length}
        </h4>
      </div>

    <div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">Leaderboard</h3>

      {leaderboard.length === 0 ? (
        <div className="text-sm text-white/50">
          Aún no hay puntuaciones
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((p, index) => {
            const position = index + 1

            let medal = ""
            if (position === 1) medal = "🥇"
            if (position === 2) medal = "🥈"
            if (position === 3) medal = "🥉"

            return (
              <div
                key={p.id}
                className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-xl flex justify-between items-center"
              >
                <div className="flex items-center gap-2 font-medium">
                  <span>{medal || `#${position}`}</span>
                  <span>{p.name}</span>
                </div>

                <div className="font-semibold text-indigo-400">
                  {p.score ?? 0} pts
                </div>
              </div>
            )
          })}
        </div>
      )}
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