"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteSession } from "@/features/session/session-actions"

type Props = {
  sessionId: string
  title: string
}

export function DeleteSessionButton({ sessionId, title }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    const confirmed = window.confirm(
      `¿Seguro que quieres borrar la sesión "${title}"? Esta acción no se puede deshacer.`
    )

    if (!confirmed) return

    startTransition(async () => {
      try {
        await deleteSession(sessionId)
        router.refresh()
      } catch (error) {
        console.error(error)
        alert("No se pudo borrar la sesión")
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
    >
      {isPending ? "Borrando..." : "Borrar"}
    </button>
  )
}