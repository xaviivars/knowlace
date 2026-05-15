"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { deleteQuestionWithSlide } from "@/features/question/question-actions"

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
        className="cursor-pointer text-red-400 transition hover:text-red-300 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? "Eliminando..." : "Eliminar pregunta"}
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