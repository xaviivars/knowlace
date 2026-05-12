"use client"

type PdfZoomControlsProps = {
  zoomPercentage: number
  canZoomIn: boolean
  canZoomOut: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onResetZoom: () => void
}

export default function PdfZoomControls({
  zoomPercentage,
  canZoomIn,
  canZoomOut,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: PdfZoomControlsProps) {
  return (
    <div className="absolute bottom-5 right-5 z-30 flex items-center gap-2 rounded-xl border border-white/15 bg-black/65 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className="rounded-md bg-white/15 px-3 py-1 text-sm font-medium transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30"
      >
        −
      </button>

      <button
        type="button"
        onClick={onResetZoom}
        className="min-w-16 rounded-md bg-white/10 px-3 py-1 text-center text-sm font-medium transition hover:bg-white/20"
      >
        {zoomPercentage}%
      </button>

      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className="rounded-md bg-white/15 px-3 py-1 text-sm font-medium transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-30"
      >
        +
      </button>
    </div>
  )
}