"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { deleteQuestionWithSlide } from "@/features/question/question-actions"
import { TrashIcon } from "@heroicons/react/24/outline"

type DeleteQuestionButtonProps = {
  questionId: string
}

export function DeleteQuestionButton({
  questionId,
}: DeleteQuestionButtonProps) {
  const router = useRouter()

  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteQuestionWithSlide(questionId)
        setIsOpen(false)
        router.refresh()
      } catch (error) {
        console.error(error)
        alert("No se pudo eliminar la pregunta")
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        disabled={isPending}
        className="
          inline-flex cursor-pointer items-center gap-2 rounded-xl
          border border-red-500/20 bg-red-500/10 px-3 py-2
          text-sm font-semibold text-red-300 transition
          hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-200
          disabled:cursor-not-allowed disabled:opacity-50
        "
      >
        <TrashIcon className="h-4 w-4 shrink-0" />
        {isPending ? "Eliminando..." : "Eliminar"}
      </button>

      <ConfirmDialog
        open={isOpen}
        title="Eliminar pregunta"
        description="Vas a eliminar esta pregunta de la sesión. Esta acción no se puede deshacer."
        confirmText="Eliminar pregunta"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isPending}
        onCancel={() => setIsOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  )
}