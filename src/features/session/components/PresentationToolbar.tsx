"use client"

type PresentationToolbarProps = {
  currentPageNumber: number
  totalPdfPages: number

  canGoPrevious: boolean
  canGoNext: boolean
  onPrevious: () => void
  onNext: () => void

  showZoomControls?: boolean
  zoomPercentage?: number
  canZoomIn?: boolean
  canZoomOut?: boolean
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
}

export default function PresentationToolbar({
  currentPageNumber,
  totalPdfPages,

  canGoPrevious,
  canGoNext,
  onPrevious,
  onNext,

  showZoomControls = false,
  zoomPercentage = 100,
  canZoomIn = false,
  canZoomOut = false,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: PresentationToolbarProps) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-center border-b border-white/10 bg-[#081120]/95 px-5 text-white shadow-sm backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
        >
          ←
        </button>

        <span className="min-w-40 rounded-lg bg-white/5 px-3 py-1.5 text-center text-sm font-medium text-white/85">
          Página {currentPageNumber} de {totalPdfPages}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
        >
          →
        </button>
      </div>

      <div className="mx-4 h-6 w-px bg-white/20" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onZoomOut}
          disabled={!showZoomControls || !canZoomOut}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
        >
          −
        </button>

        <button
          type="button"
          onClick={onResetZoom}
          disabled={!showZoomControls}
          className="min-w-16 rounded-lg bg-white/5 px-3 py-1.5 text-center text-sm font-medium text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30"
        >
          {zoomPercentage}%
        </button>

        <button
          type="button"
          onClick={onZoomIn}
          disabled={!showZoomControls || !canZoomIn}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}