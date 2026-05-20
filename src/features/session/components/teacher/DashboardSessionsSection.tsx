"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { SessionOptionsMenu } from "@/features/session/components/teacher/SessionOptionsMenu"
import { MagnifyingGlassIcon, ChevronDownIcon, CheckIcon } from "@heroicons/react/24/outline"

type DashboardSession = {
  id: string
  title: string
  description: string | null
  accessCode: string
  isActive: boolean
  pdfPages: number
  createdAt: Date | string
}

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE"

type DashboardSessionsSectionProps = {
  sessions: DashboardSession[]
}

const filterOptions: {
  value: FilterStatus
  label: string
}[] = [
  { value: "ALL", label: "Todas" },
  { value: "ACTIVE", label: "Activas" },
  { value: "INACTIVE", label: "Inactivas" },
]

export function DashboardSessionsSection({
  sessions,
}: DashboardSessionsSectionProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL")

  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const selectedFilterLabel =
    filterOptions.find((option) => option.value === statusFilter)?.label ?? "Todas"

  const filteredSessions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return sessions.filter((session) => {
      const matchesSearch =
        !normalizedSearch ||
        session.title.toLowerCase().includes(normalizedSearch) ||
        session.description?.toLowerCase().includes(normalizedSearch) ||
        session.accessCode.toLowerCase().includes(normalizedSearch)

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && session.isActive) ||
        (statusFilter === "INACTIVE" && !session.isActive)

      return matchesSearch && matchesStatus
    })
  }, [sessions, search, statusFilter])

  const sessionsCountText =
    sessions.length === 0
      ? "Todavía no has creado ninguna sesión."
      : sessions.length === 1
        ? "1 sesión creada."
        : `${sessions.length} sesiones creadas.`

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Tus sesiones</h2>
          <p className="mt-1 text-sm text-white/50">
            {sessionsCountText}
          </p>
        </div>

        {sessions.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por título, descripción o código..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/60 focus:bg-white/10 sm:w-86"
              />
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                onBlur={() => {
                  setTimeout(() => setIsFilterOpen(false), 120)
                }}
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-between
                  gap-3
                  rounded-xl
                  border border-white/10
                  bg-white/5
                  px-4
                  text-sm
                  text-white
                  outline-none
                  transition
                  hover:bg-white/10
                  focus:border-blue-400/60
                  focus:bg-white/10
                  sm:w-36
                "
              >
                <span>{selectedFilterLabel}</span>

                <ChevronDownIcon
                  className={`h-4 w-4 text-white/45 transition-transform ${
                    isFilterOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 z-30 mt-2 flex w-full min-w-40 flex-col gap-1 overflow-hidden rounded-xl border border-white/10 bg-[#0b1628] p-1 shadow-2xl shadow-black/30">
                  {filterOptions.map((option) => {
                    const isSelected = statusFilter === option.value

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setStatusFilter(option.value)
                          setIsFilterOpen(false)
                        }}
                        className={`
                          flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition
                          ${
                            isSelected
                              ? "bg-blue-500/15 text-blue-200"
                              : "text-white/75 hover:bg-white/10 hover:text-white"
                          }
                        `}
                      >
                        <span>{option.label}</span>

                        {isSelected && (
                          <CheckIcon className="h-4 w-4 text-blue-300" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {sessions.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-white/15 bg-[#142544] p-10 text-center shadow-xl">

          <h3 className="text-2xl font-bold">Crea tu primera sesión</h3>

          <p className="mx-auto mt-3 max-w-xl text-white/60">
            Sube un PDF, configura la sesión y empieza a generar preguntas
            para tus alumnos.
          </p>

          <Link
            href="/dashboard/sessions/new"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-500 active:scale-[0.98]"
          >
            Crear sesión
          </Link>
        </section>
      ) : filteredSessions.length === 0 ? (
        <section className="rounded-3xl border border-white/10 bg-[#142544]/70 p-10 text-center shadow-xl">
          <h3 className="text-xl font-semibold">
            No se han encontrado sesiones
          </h3>

          <p className="mt-2 text-white/55">
            Prueba con otro título, descripción, código o cambia el filtro.
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("")
              setStatusFilter("ALL")
            }}
            className="mt-5 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            Limpiar filtros
          </button>
        </section>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredSessions.map((s) => (
            <article
              key={s.id}
              className="group flex min-h-55 flex-col justify-between rounded-3xl border border-white/10 bg-[#142544] p-6 shadow-xl transition hover:-translate-y-1 hover:border-blue-400/60 hover:shadow-blue-950/40"
            >
              <Link
                href={`/dashboard/sessions/${s.id}`}
                className="block flex-1"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="line-clamp-2 text-xl font-bold text-white group-hover:text-blue-200">
                      {s.title}
                    </h3>

                    <p className="mt-2 line-clamp-3 text-sm text-white/55">
                      {s.description || "Sin descripción."}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      s.isActive
                        ? "bg-green-500/15 text-green-300"
                        : "bg-zinc-500/15 text-zinc-300"
                    }`}
                  >
                    {s.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm">
                  <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
                    <p className="text-xs uppercase tracking-wide text-white/35">
                      Código de acceso
                    </p>
                    <p className="mt-1 font-mono text-lg font-semibold tracking-widest text-blue-200">
                      {s.accessCode}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>
                      {s.pdfPages} página{s.pdfPages === 1 ? "" : "s"}
                    </span>
                    <span>
                      {new Date(s.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              </Link>

              <div className="mt-5 flex items-center justify-end border-t border-white/10 pt-4">
                <SessionOptionsMenu
                  sessionId={s.id}
                  title={s.title}
                />
              </div>
            </article>
          ))}
        </section>
      )}
    </section>
  )
}