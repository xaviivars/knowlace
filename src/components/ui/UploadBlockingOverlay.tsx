type UploadBlockingOverlayProps = {
  show: boolean
  title?: string
  description?: string
}

export function UploadBlockingOverlay({
  show,
  title = "Subiendo archivo",
  description = "Espera un momento. Estamos preparando tu sesión.",
}: UploadBlockingOverlayProps) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#142544] p-8 text-center text-white shadow-2xl">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-300/30 border-t-blue-300" />
        </div>

        <h2 className="text-2xl font-bold">
          {title}
        </h2>

        <p className="mt-3 text-sm leading-relaxed text-white/60">
          {description}
        </p>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/3 animate-[uploadBar_1.2s_ease-in-out_infinite] rounded-full bg-blue-400" />
        </div>

        <p className="mt-4 text-xs text-white/40">
          No cierres esta ventana hasta que termine el proceso.
        </p>
      </div>

      <style jsx>{`
        @keyframes uploadBar {
          0% {
            transform: translateX(-120%);
          }
          50% {
            transform: translateX(120%);
          }
          100% {
            transform: translateX(360%);
          }
        }
      `}</style>
    </div>
  )
}