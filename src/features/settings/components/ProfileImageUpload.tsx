"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  CameraIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import {
  updateProfileImageAction,
  deleteProfileImageAction,
} from "@/features/settings/settings-actions"

type ProfileImageUploadProps = {
  user: {
    name: string
    image: string | null
  }
}

export function ProfileImageUpload({ user }: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    const formData = new FormData()
    formData.append("image", file)

    setIsUploading(true)
    setError(null)

    try {
      await updateProfileImageAction(formData)
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen."
      )
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  async function handleDeleteImage() {
    const confirmed = window.confirm(
      "¿Seguro que quieres eliminar tu foto de perfil?"
    )

    if (!confirmed) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteProfileImageAction()
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen."
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const initial = user.name.trim().charAt(0).toUpperCase() || "U"

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-5">
        {user.image ? (
          <img
            src={user.image}
            alt=""
            referrerPolicy="no-referrer"
            className="h-20 w-20 rounded-full object-cover ring-2 ring-white/10"
          />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-500/20 text-2xl font-bold text-blue-200 ring-2 ring-white/10">
            {initial}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading || isDeleting}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CameraIcon className="h-4 w-4" />
              {isUploading ? "Subiendo..." : "Cambiar foto"}
            </button>

            {user.image && (
              <button
                type="button"
                onClick={handleDeleteImage}
                disabled={isUploading || isDeleting}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            )}
          </div>

          <p className="text-sm text-white/45">
            JPG, PNG o WEBP. Máximo 2MB.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}