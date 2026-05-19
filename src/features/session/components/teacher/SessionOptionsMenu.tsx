"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  EllipsisVerticalIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import {
  archiveSession,
  deleteSession,
} from "@/features/session/session-actions"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"

type SessionOptionsMenuProps = {
  sessionId: string
  title: string
}

export function SessionOptionsMenu({
  sessionId,
  title,
}: SessionOptionsMenuProps) {
  const router = useRouter()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)

  const [isPending, startTransition] = useTransition()

  function handleArchive() {
    startTransition(async () => {
      try {
        await archiveSession(sessionId)
        setIsArchiveDialogOpen(false)
        setIsMenuOpen(false)
        router.refresh()
      } catch (error) {
        console.error(error)
        alert("No se pudo archivar la sesión")
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteSession(sessionId)
        setIsDeleteDialogOpen(false)
        setIsMenuOpen(false)
        router.refresh()
      } catch (error) {
        console.error(error)
        alert("No se pudo eliminar la sesión")
      }
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        onBlur={() => {
            setTimeout(() => setIsMenuOpen(false), 120)
        }}
        disabled={isPending}
        className="
            flex h-8 w-8 cursor-pointer items-center justify-center rounded-full
            text-white/45 transition
            hover:bg-white/10 hover:text-white
            disabled:cursor-not-allowed disabled:opacity-50
        "
        aria-label="Opciones de sesión"
        >
        <EllipsisVerticalIcon className="h-5 w-5" />
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1628] p-1.5 shadow-2xl shadow-black/40">
          <Link
            href={`/dashboard/sessions/${sessionId}/edit`}
            onMouseDown={(event) => event.preventDefault()}
            className="
              flex w-full items-center gap-3 rounded-xl px-3 py-2.5
              text-left text-sm font-medium text-white/75 transition
              hover:bg-white/10 hover:text-white
            "
          >
            <PencilSquareIcon className="h-4 w-4 text-blue-300" />
            Editar preguntas
          </Link>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setIsArchiveDialogOpen(true)
              setIsMenuOpen(false)
            }}
            className="
              flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5
              text-left text-sm font-medium text-white/75 transition
              hover:bg-white/10 hover:text-white
            "
          >
            <ArchiveBoxIcon className="h-4 w-4 text-white/45" />
            Archivar sesión
          </button>

          <div className="my-1 h-px bg-white/10" />

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setIsDeleteDialogOpen(true)
              setIsMenuOpen(false)
            }}
            className="
              flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5
              text-left text-sm font-medium text-red-300 transition
              hover:bg-red-500/10 hover:text-red-200
            "
          >
            <TrashIcon className="h-4 w-4" />
            Eliminar sesión
          </button>
        </div>
      )}

      <ConfirmDialog
        open={isArchiveDialogOpen}
        title="Archivar sesión"
        description={`La sesión "${title}" dejará de aparecer en tu panel principal, pero podrás restaurarla más adelante.`}
        confirmText="Archivar sesión"
        cancelText="Cancelar"
        variant="default"
        isLoading={isPending}
        onCancel={() => setIsArchiveDialogOpen(false)}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Eliminar sesión"
        description={`Vas a eliminar la sesión "${title}". También se eliminará el PDF asociado. Esta acción no se puede deshacer.`}
        confirmText="Eliminar sesión"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isPending}
        onCancel={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}