"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { deleteSession } from "@/features/session/session-actions"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

type Props = {
  sessionId: string
  title: string
}

export function DeleteSessionButton({ sessionId, title }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

    function handleDelete() {
      startTransition(async () => {
        try {
          await deleteSession(sessionId)
          setIsOpen(false)
          router.refresh()
        } catch (error) {
          console.error(error)
          alert("No se pudo borrar la sesión")
        }
      })
    }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {isPending ? "Borrando..." : "Borrar"}
      </button>

      <ConfirmDialog
        open={isOpen}
        title="Eliminar sesión"
        description={`Vas a eliminar la sesión "${title}". También se eliminará el PDF asociado. Esta acción no se puede deshacer.`}
        confirmText="Eliminar sesión"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isPending}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}