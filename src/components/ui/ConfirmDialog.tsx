"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "default"
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "default",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        onCancel()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, isLoading, onCancel])

  if (!mounted || !open) return null

  const confirmButtonClass =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 text-white"
      : "bg-blue-700 hover:bg-blue-600 text-white"

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Cerrar diálogo"
        disabled={isLoading}
        onClick={onCancel}
        className="absolute inset-0 cursor-default disabled:cursor-not-allowed"
      />

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-white/10 bg-[#142544] p-8 text-white shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">
            {title}
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-white/60">
            {description}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmButtonClass}`}
          >
            {isLoading ? "Procesando..." : confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}