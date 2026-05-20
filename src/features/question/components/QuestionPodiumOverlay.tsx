"use client"

type PodiumParticipant = {
  id: string
  name: string
  score?: number
  answerTimeMs?: number
}

type QuestionPodiumOverlayProps = {
  podium: PodiumParticipant[]
  totalAnswers: number
  correctAnswers: number
  totalParticipants?: number
  accuracy?: number
  onContinue: () => void
}

export function QuestionPodiumOverlay({
  podium,
  totalAnswers,
  correctAnswers,
  totalParticipants,
  accuracy,
  onContinue,
}: QuestionPodiumOverlayProps) {
  const first = podium[0]
  const second = podium[1]
  const third = podium[2]

  const calculatedAccuracy =
    typeof accuracy === "number"
      ? accuracy
      : totalAnswers > 0
        ? Math.round((correctAnswers / totalAnswers) * 100)
        : 0

  const hasWinners = podium.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06101f]/90 px-6 text-white backdrop-blur-xl">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-3xl border border-white/10 bg-[#142544]/95 p-10 shadow-2xl shadow-black/40">
        <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-3xl" />

        <div className="relative z-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">
            Resultados
          </p>

          <h2 className="mt-3 text-5xl font-black tracking-tight">
            Podio de la sesión
          </h2>

          <p className="mt-3 text-white/55">
            {hasWinners
              ? "Encabezan el ranking:"
              : "Todavía no hay participantes con puntuación."}
          </p>
        </div>

        <div className="relative z-10 mt-12 flex items-end justify-center gap-5 md:gap-8">
          <PodiumPlace
            place={2}
            participant={second}
            heightClass="h-36"
            medal="🥈"
            delayClass="[animation-delay:120ms]"
          />

          <PodiumPlace
            place={1}
            participant={first}
            heightClass="h-56"
            medal="🥇"
            featured
            delayClass="[animation-delay:0ms]"
          />

          <PodiumPlace
            place={3}
            participant={third}
            heightClass="h-28"
            medal="🥉"
            delayClass="[animation-delay:220ms]"
          />
        </div>

        <div className="relative z-10 mt-10 grid gap-4 md:grid-cols-3">
          <PodiumMetric
            label="Respuestas"
            value={
              typeof totalParticipants === "number"
                ? `${totalAnswers}/${totalParticipants}`
                : String(totalAnswers)
            }
          />

          <PodiumMetric
            label="Aciertos"
            value={String(correctAnswers)}
          />

          <PodiumMetric
            label="Precisión"
            value={`${calculatedAccuracy}%`}
          />
        </div>

        <div className="relative z-10 mt-8 flex justify-center">
          <button
            type="button"
            onClick={onContinue}
            className="cursor-pointer rounded-xl bg-blue-700 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-600 active:scale-[0.98]"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  )
}

function PodiumPlace({
  place,
  participant,
  heightClass,
  medal,
  featured = false,
  delayClass,
}: {
  place: 1 | 2 | 3
  participant?: PodiumParticipant
  heightClass: string
  medal: string
  featured?: boolean
  delayClass?: string
}) {
  return (
    <div
      className={`
        flex w-32 flex-col items-center opacity-0 md:w-44
        ${
          featured
            ? "animate-[podiumWinnerEnter_0.55s_ease-out_forwards]"
            : "animate-[podiumEnter_0.45s_ease-out_forwards]"
        }
        ${delayClass ?? ""}
      `}
    >
      <div
        className={`
          mb-4 flex h-20 w-20 items-center justify-center rounded-full border text-4xl shadow-xl
          ${
            featured
              ? "animate-[podiumGlow_2s_ease-in-out_infinite] border-yellow-300/30 bg-yellow-400/15 shadow-yellow-900/30"
              : "border-white/10 bg-white/10 shadow-black/20"
          }
        `}
      >
        {medal}
      </div>

      <div className="mb-4 min-h-16 text-center">
        <p className="line-clamp-1 text-lg font-bold text-white">
          {participant?.name ?? "Sin acierto"}
        </p>

        {participant ? (
          <div className="mt-1 space-y-0.5">
            {typeof participant.score === "number" && (
              <p className="text-sm text-white/45">
                {participant.score} pts
              </p>
            )}

            {typeof participant.answerTimeMs === "number" && (
              <p className="font-mono text-xs text-blue-200/70">
                {(participant.answerTimeMs / 1000).toFixed(2)}s
              </p>
            )}
          </div>
        ) : (
          <p className="mt-1 text-sm text-white/30">
            —
          </p>
        )}
      </div>

      <div
        className={`
          flex w-full flex-col items-center justify-center rounded-t-3xl border border-white/10
          bg-linear-to-b from-white/15 to-white/5
          ${heightClass}
          ${featured ? "ring-2 ring-yellow-300/20" : ""}
        `}
      >
        <span className="text-5xl font-black text-white/90">
          {place}
        </span>

        <span className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/35">
          puesto
        </span>
      </div>
    </div>
  )
}

function PodiumMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-5 text-center">
      <p className="text-sm text-white/45">
        {label}
      </p>

      <p className="mt-2 text-3xl font-black text-white">
        {value}
      </p>
    </div>
  )
}