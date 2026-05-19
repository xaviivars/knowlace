"use client"

import { useState, useEffect } from "react"

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

  const [localError, setLocalError] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)

  const trimmedName = name.trim()
  const canJoin = trimmedName.length >= 2
  const visibleError = localError ?? error

  function triggerShake() {
    setIsShaking(false)

    requestAnimationFrame(() => {
      setIsShaking(true)
    })

    setTimeout(() => {
      setIsShaking(false)
    }, 400)
  }

  function showLocalError(message: string) {
    setLocalError(message)
    triggerShake()
  }

  useEffect(() => {
    if (error) {
      triggerShake()
    }
  }, [error])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!trimmedName) {
      showLocalError("Introduce tu nombre para entrar.")
      return
    }

    if (trimmedName.length < 2) {
      showLocalError("El nombre debe tener al menos 2 caracteres.")
      return
    }

    setLocalError(null)
    onJoin()
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[#0b162c] px-6 py-10 text-white">
      <div
        className={`
          w-full max-w-md rounded-3xl border bg-[#142544]/90 p-8 text-center shadow-2xl shadow-black/25 backdrop-blur
          transition-colors
          ${visibleError ? "border-red-400/30" : "border-white/10"}
          ${isShaking ? "animate-[joinShake_0.38s_ease-in-out]" : ""}
        `}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15 text-3xl">
          👋
        </div>

        <h2 className="text-3xl font-bold tracking-tight">
          Unirse a la sesión
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-white/55">
          Escribe el nombre con el que aparecerás en la sesión del profesor.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div className="text-left">
            <label className="mb-3 block text-sm font-medium text-white/65">
              Nombre
            </label>

            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setLocalError(null)
              }}
              placeholder="Tu nombre"
              autoFocus
              maxLength={40}
              className={`
                h-13
                w-full
                rounded-xl
                border
                bg-black/15
                px-5
                text-center
                text-base
                font-medium
                text-white
                outline-none
                transition
                placeholder:text-white/35
                focus:bg-white/10
                ${
                  visibleError
                    ? "border-red-400/50 focus:border-red-400/70"
                    : "border-white/10 focus:border-blue-400/60"
                }
              `}
            />
          </div>

          {visibleError && (
            <div
              role="alert"
              aria-live="polite"
              className="flex items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-center text-sm font-medium text-red-300"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-xs">
                !
              </span>

              <span>
                {visibleError}
              </span>
            </div>
          )}

          <button
            type="submit"
            disabled={!canJoin}
            className="
              h-12
              w-full
              cursor-pointer
              rounded-xl
              bg-blue-800
              px-5
              text-sm
              font-semibold
              text-white
              shadow-lg
              transition
              hover:bg-blue-600
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Entrar en la sesión
          </button>
        </form>

        <p className="mt-5 text-xs text-white/35">
          El nombre será visible para el profesor durante la actividad.
        </p>
      </div>
    </div>
  )
}