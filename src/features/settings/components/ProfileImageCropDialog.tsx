"use client"

import { useState } from "react"
import Cropper, { Area } from "react-easy-crop"
import { getCroppedImageFile } from "@/lib/images/cropImage"

type ProfileImageCropDialogProps = {
  imageSrc: string
  fileName?: string
  isProcessing?: boolean
  onCancel: () => void
  onConfirm: (file: File) => void
}

export function ProfileImageCropDialog({
  imageSrc,
  fileName,
  isProcessing = false,
  onCancel,
  onConfirm,
}: ProfileImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirm() {
    if (!croppedAreaPixels) return

    try {
      setError(null)

      const cleanFileName = fileName
        ? fileName.replace(/\.[^/.]+$/, "")
        : "avatar"

      const croppedFile = await getCroppedImageFile({
        imageSrc,
        crop: croppedAreaPixels,
        fileName: `${cleanFileName}.webp`,
      })

      onConfirm(croppedFile)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo recortar la imagen."
      )
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 px-6 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#142544] text-white shadow-2xl shadow-black/40">
        <div className="shrink-0 border-b border-white/10 px-7 py-5">
          <h2 className="text-2xl font-bold">
            Ajustar foto de perfil
          </h2>

          <p className="mt-2 text-sm text-white/55">
            Mueve y amplía la imagen para elegir cómo se verá tu avatar.
          </p>
        </div>

        <div className="relative h-96 bg-black/30">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, croppedAreaPixels) => {
              setCroppedAreaPixels(croppedAreaPixels)
            }}
          />
        </div>

        <div className="space-y-4 border-t border-white/10 px-7 py-5">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-white/65">
                Zoom
              </span>

              <span className="font-mono text-white/40">
                {zoom.toFixed(1)}x
              </span>
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="w-full cursor-pointer accent-blue-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isProcessing}
              className="cursor-pointer rounded-xl bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isProcessing ? "Guardando..." : "Guardar foto"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}