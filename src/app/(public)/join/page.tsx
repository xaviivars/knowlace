"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { checkSessionAccessCode } from "@/features/session/session-actions"

export default function Join() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isShaking, setIsShaking] = useState(false)

  const router = useRouter();

  const normalizedCode = code.trim().toUpperCase();
  const canJoin = normalizedCode.length > 0;

  function showError(message: string) {
    setError(message)
    setIsShaking(false)

    requestAnimationFrame(() => {
      setIsShaking(true)
    })

    setTimeout(() => {
      setIsShaking(false)
    }, 400)
  }

  const handleJoin = async () => {
    if (!canJoin) {
      showError("Introduce un código de sesión.")
      return
    }

    setIsChecking(true)
    setError(null)

    try {
      const result = await checkSessionAccessCode(normalizedCode)

      if (!result.exists) {
        showError("Código erróneo")
        return
      }

      router.push(`/session/${normalizedCode}`)
    } catch (error) {
      console.error(error)
      showError("No se pudo comprobar la sesión.")
    } finally {
      setIsChecking(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleJoin();
  }

  return (
<div className="mx-auto w-full max-w-3xl">
      <section className="mb-10 text-center">
        <h1 className="text-6xl font-bold tracking-tight">
          Knowlace.
        </h1>

        <p className="mt-4 text-lg text-white/60">
          Únete a una sesión interactiva introduciendo el código que te ha
          proporcionado tu profesor.
        </p>
      </section>

      <section
        className={`
          rounded-3xl border bg-[#142544]/80 p-8 shadow-2xl shadow-black/25 backdrop-blur
          transition-colors
          ${
            error
              ? "border-red-400/30"
              : "border-white/10"
          }
          ${
            isShaking
              ? "[animation:joinShake_0.38s_ease-in-out]"
              : ""
          }
        `}
      >
        <div className="mb-7 text-center">
          <h2 className="text-3xl font-bold">
            Entrar a una sesión
          </h2>

          <p className="mt-3 text-white/55">
            Escribe el código de acceso para empezar.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-xl flex-col gap-4 sm:flex-row"
        >
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase())
              setError(null)
              setIsShaking(false)
            }}
            className={`
              h-13
              flex-1
              rounded-xl
              border
              bg-black/15
              text-center
              text-lg
              font-semibold
              uppercase
              tracking-[0.25em]
              text-white
              placeholder:normal-case
              placeholder:tracking-normal
              placeholder:text-white/35
              focus:bg-white/10
              ${
                error
                  ? "border-red-400/50 focus:border-red-400/70"
                  : "border-white/10 focus:border-blue-400/60"
              }
            `}
            placeholder="Código de sesión"
          />

          <Button
            type="submit"
            disabled={!canJoin || isChecking}
            className="
              h-13
              min-w-40
              cursor-pointer
              rounded-xl
              bg-blue-800
              px-6
              font-semibold
              text-white
              transition
              hover:bg-blue-600
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isChecking ? "Comprobando..." : "Unirse"}
          </Button>
        </form>

        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mx-auto mt-4 flex max-w-xl items-center justify-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 text-center text-sm font-medium text-red-300"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/15 text-xs">
              !
            </span>

            <span>
              {error}
            </span>
          </div>
        )}

        <p className="mt-5 text-center text-sm text-white/40">
          El código suele tener letras y números. No importa si lo escribes en
          minúsculas.
        </p>
      </section>
    </div>
  )
}