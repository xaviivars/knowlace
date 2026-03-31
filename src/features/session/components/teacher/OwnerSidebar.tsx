"use client"

type Participant = {
  id: string
  name: string
  score?: number
  isActive?: boolean
}

type TeacherSidebarProps = {
  sessionTitle: string
  accessCode: string
  isActive: boolean
  participants: Participant[]
  leaderboard: Participant[]
}

export function OwnerSidebar({
  sessionTitle,
  accessCode,
  isActive,
  participants,
  leaderboard
}: TeacherSidebarProps) {
  return (
    <aside className="w-87.5 bg-[#142544] border-l border-white/10 p-6 flex flex-col overflow-y-auto">
      
      {/* HEADER */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">{sessionTitle}</h2>
        <p className="text-sm text-white/60 mt-1">
          {isActive ? "Sesión activa" : "Esperando inicio"}
        </p>
      </div>

      <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">
            Código de acceso
          </p>
          <p className="text-lg font-bold text-indigo-300">{accessCode}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-white/50">
            Participantes conectados
          </p>
          <p className="text-base font-semibold">{participants.length}</p>
        </div>
      </div>

      {/* LEADERBOARD */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Leaderboard</h3>

        {leaderboard.length === 0 ? (
          <div className="text-sm text-white/50">
            Aún no hay puntuaciones
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((p, index) => {
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
                  <div className="flex items-center gap-3 font-medium min-w-0">

                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        p.isActive
                          ? "bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)] scale-110"
                          : "bg-red-400 scale-100"
                      }`}
                    />

                    <span>{medal || `#${position}`}</span>

                    <span className="truncate">{p.name}</span>
                  </div>

                  <div className="font-semibold text-indigo-400 shrink-0">
                    {p.score ?? 0} pts
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}