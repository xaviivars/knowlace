"use client"

import { useState } from "react"
import Link from "next/link"

type HistoryTab = "summary" | "participants" | "questions"

type ArchivedSessionHistoryViewProps = {
  session: {
    id: string
    title: string
    description: string | null
    accessCode: string
    createdAt: string
    archivedAt: string | null
    participants: {
      id: string
      name: string
      score: number
      totalAnswers: number
      correctAnswers: number
      accuracy: number
    }[]
    questions: {
      id: string
      content: string
      type: string
      totalAnswers: number
      correctAnswers: number
      accuracy: number
    }[]
  }
}

const tabs: {
  id: HistoryTab
  label: string
}[] = [
  { id: "summary", label: "Resumen" },
  { id: "participants", label: "Participantes" },
  { id: "questions", label: "Preguntas" },
]

export function ArchivedSessionHistoryView({
  session,
}: ArchivedSessionHistoryViewProps) {
  const [activeTab, setActiveTab] = useState<HistoryTab>("summary")

  const totalParticipants = session.participants.length
  const totalQuestions = session.questions.length

  const averageAccuracy =
    totalParticipants > 0
      ? Math.round(
          session.participants.reduce(
            (sum, participant) => sum + participant.accuracy,
            0
          ) / totalParticipants
        )
      : 0

  return (
    <div className="flex h-full min-h-0 flex-col px-6 py-8 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col gap-6">
        <header className="rounded-3xl border border-white/10 bg-[#142544]/80 p-7 shadow-2xl shadow-black/20">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-[0.25em] text-blue-300">
                Histórico de sesión
              </p>

              <h1 className="text-4xl font-bold">
                {session.title}
              </h1>

              <p className="mt-3 max-w-3xl text-white/55">
                {session.description || "Sin descripción."}
              </p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/45">
                <span className="rounded-full border border-white/10 bg-black/15 px-3 py-1">
                  Código:{" "}
                  <span className="font-mono text-blue-200">
                    {session.accessCode}
                  </span>
                </span>

                <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-amber-200">
                  Archivada
                </span>
              </div>
            </div>

            <Link
              href="/dashboard/settings"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              Volver a ajustes
            </Link>
          </div>
        </header>

        <nav className="flex shrink-0 gap-2 rounded-2xl border border-white/10 bg-[#142544]/70 p-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-white/55 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </nav>

        <main className="min-h-0 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-[#142544]/70 p-6 shadow-xl [scrollbar-width:thin] [scrollbar-color:rgb(82_82_91)_transparent]">
          {activeTab === "summary" && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <MetricCard
                  label="Participantes"
                  value={String(totalParticipants)}
                />

                <MetricCard
                  label="Preguntas"
                  value={String(totalQuestions)}
                />

                <MetricCard
                  label="Acierto medio"
                  value={`${averageAccuracy}%`}
                />
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/15 p-5">
                <h2 className="text-xl font-bold">
                  Información de archivo
                </h2>

                <div className="mt-4 space-y-3 text-sm text-white/55 ">
                  <p>
                    Creada el{" "}
                    <span className="text-white/80">
                      {new Date(session.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </p>

                  <p>
                    Archivada el{" "}
                    <span className="text-white/80">
                      {session.archivedAt
                        ? new Date(session.archivedAt).toLocaleDateString("es-ES")
                        : "—"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "participants" && (
            <div className="space-y-3">
              {session.participants.length === 0 ? (
                <EmptyState text="No hubo participantes en esta sesión." />
              ) : (
                session.participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 text-sm md:grid-cols-[1fr_auto_auto_auto]"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {participant.name}
                      </p>
                      <p className="text-white/40">
                        {participant.totalAnswers} respuestas
                      </p>
                    </div>

                    <p className="text-white/70">
                      {participant.correctAnswers} aciertos
                    </p>

                    <p className="font-semibold text-blue-200">
                      {participant.accuracy}%
                    </p>

                    <p className="font-bold text-white">
                      {participant.score} pts
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "questions" && (
            <div className="space-y-3">
              {session.questions.length === 0 ? (
                <EmptyState text="Esta sesión no tenía preguntas." />
              ) : (
                session.questions.map((question) => (
                  <div
                    key={question.id}
                    className="rounded-2xl border border-white/10 bg-black/15 p-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold text-white">
                          {question.content}
                        </p>

                        <p className="mt-1 text-xs uppercase tracking-wide text-white/35">
                          {question.type}
                        </p>
                      </div>

                      <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                        <p className="text-sm font-bold text-blue-200">
                          {question.accuracy}%
                        </p>
                        <p className="text-xs text-white/40">
                          acierto
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/45">
                      <span>{question.totalAnswers} respuestas</span>
                      <span>{question.correctAnswers} aciertos</span>
                      <span>
                        {question.totalAnswers - question.correctAnswers} fallos
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-5">
      <p className="text-sm text-white/45">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-white">
        {value}
      </p>
    </div>
  )
}

function EmptyState({
  text,
}: {
  text: string
}) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-black/15 p-8 text-center text-white/45">
      {text}
    </div>
  )
}