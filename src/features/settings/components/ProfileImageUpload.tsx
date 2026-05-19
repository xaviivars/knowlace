"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  PencilIcon,
  TrashIcon,
  CameraIcon,
} from "@heroicons/react/24/outline"
import {
  updateProfileImageAction,
  deleteProfileImageAction,
} from "@/features/settings/settings-actions"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { ProfileImageCropDialog } from "@/features/settings/components/ProfileImageCropDialog"

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null)

  function openFilePicker() {
    if (isUploading || isDeleting) return
    inputRef.current?.click()
  }

  function isGoogleProfileImage(imageUrl: string | null) {
    if (!imageUrl) return false

    return (
      imageUrl.includes("googleusercontent.com") ||
      imageUrl.includes("google.com")
    )
  }

  const isGoogleImage = isGoogleProfileImage(user.image)
  const canEditCurrentImage = Boolean(user.image) && !isGoogleImage

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) return

    setError(null)

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Formato no permitido. Usa JPG, PNG o WEBP.")
      event.target.value = ""
      return
    }

    const imageUrl = URL.createObjectURL(file)

    setSelectedImageSrc(imageUrl)
    setSelectedFileName(file.name)

    event.target.value = ""
  }

  function handleCancelCrop() {
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc)
    }

    setSelectedImageSrc(null)
    setSelectedFileName(null)
  }

  function handleEditCurrentImage() {
    if (!user.image || isGoogleImage || isUploading || isDeleting) return

    setError(null)
    setSelectedImageSrc(user.image)
    setSelectedFileName("avatar-actual.webp")
  }

  async function handleUploadCroppedImage(file: File) {
    const formData = new FormData()
    formData.append("image", file)

    setIsUploading(true)
    setError(null)

    try {
      await updateProfileImageAction(formData)
      handleCancelCrop()
      router.refresh()
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen."
      )
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDeleteImage() {

    setIsDeleting(true)
    setError(null)

    try {
      await deleteProfileImageAction()
      setIsDeleteDialogOpen(false)
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
   <>
      <div className="space-y-4">
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={canEditCurrentImage ? handleEditCurrentImage : openFilePicker}
            disabled={isUploading || isDeleting}
            className={`
              group relative shrink-0 rounded-full disabled:cursor-not-allowed disabled:opacity-50
              ${canEditCurrentImage ? "cursor-pointer" : "cursor-default"}
            `}
            aria-label={
              canEditCurrentImage
                ? "Editar encuadre de foto"
                : "Foto de perfil"
            }
          >
            {user.image ? (
              <img
                src={user.image}
                alt=""
                referrerPolicy="no-referrer"
                className={`
                  h-28 w-28 rounded-full object-cover ring-2 ring-white/10 transition
                  ${canEditCurrentImage ? "group-hover:ring-blue-400/50" : ""}
                `}
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-500/20 text-2xl font-bold text-blue-200 ring-2 ring-white/10">
                {initial}
              </div>
            )}

            {canEditCurrentImage && (
              <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-blue-800 text-white shadow-lg shadow-black/30 transition group-hover:bg-blue-600">
                <PencilIcon className="h-4 w-4" />
              </span>
            )}
          </button>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={openFilePicker}
                disabled={isUploading || isDeleting}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CameraIcon className="h-4 w-4" />
                  {isUploading
                    ? "Subiendo..."
                    : user.image
                      ? "Subir nueva foto"
                      : "Subir foto"}
              </button>

              {user.image && (
                <button
                  type="button"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  disabled={isUploading || isDeleting}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:border-red-400/40 hover:bg-red-500/20 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50"
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

        <ConfirmDialog
          open={isDeleteDialogOpen}
          title="Eliminar foto de perfil"
          description="Tu foto actual se eliminará y se mostrará la inicial de tu nombre en la barra lateral. Esta acción no se puede deshacer."
          confirmText="Eliminar foto"
          cancelText="Cancelar"
          variant="danger"
          isLoading={isDeleting}
          onCancel={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteImage}
        />

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {selectedImageSrc && (
        <ProfileImageCropDialog
          imageSrc={selectedImageSrc}
          fileName={selectedFileName ?? undefined}
          isProcessing={isUploading}
          onCancel={handleCancelCrop}
          onConfirm={handleUploadCroppedImage}
        />
      )}
    </>
  )
}