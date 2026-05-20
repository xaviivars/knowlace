"use client"

import { useEffect, useState, type ReactNode } from "react"

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
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  onGoToPage?: (page: number) => void

  rightActions?: ReactNode
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
  isFullscreen,
  onToggleFullscreen,
  onGoToPage,

  rightActions
}: PresentationToolbarProps) {

  const [pageInput, setPageInput] = useState(String(currentPageNumber || 1))

  useEffect(() => {
    setPageInput(String(currentPageNumber || 1))
  }, [currentPageNumber])

  function getNormalizedInputPage() {
    const trimmedValue = pageInput.trim()

    if (!trimmedValue) {
      return null
    }

    const page = Number(trimmedValue)

    if (!Number.isInteger(page)) {
      return null
    }

    return Math.min(Math.max(page, 1), totalPdfPages)
  }

  function commitPageInput() {
    const normalizedPage = getNormalizedInputPage()

    if (!normalizedPage) {
      setPageInput(String(currentPageNumber || 1))
      return false
    }

    setPageInput(String(normalizedPage))

    if (normalizedPage !== currentPageNumber) {
      onGoToPage?.(normalizedPage)
      return true
    }

    return false
  }

  function handleGoToPage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    commitPageInput()
  }

  function handlePreviousClick() {
    const hasChangedPage = commitPageInput()

    if (!hasChangedPage) {
      onPrevious()
    }
  }

  function handleNextClick() {
    const hasChangedPage = commitPageInput()

    if (!hasChangedPage) {
      onNext()
    }
  }

  return (
    <div className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 bg-[#081120]/95 px-5 text-white shadow-sm backdrop-blur">
      <div className="col-start-2 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePreviousClick}
            disabled={!canGoPrevious}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
          >
            ←
          </button>

          <form
            onSubmit={handleNextClick}
            className="flex h-8 w-36 items-center justify-center rounded-lg bg-white/5 px-2 text-sm font-medium text-white/85"
          >
            <span className="leading-none text-white/55">
              Página
            </span>

            <input
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onBlur={() => {
                commitPageInput()
              }}
              disabled={!onGoToPage}
              inputMode="numeric"
              className="
                mx-0.5
                flex
                h-6
                w-7
                items-center
                rounded-md
                border border-transparent
                bg-transparent
                p-0
                text-center
                text-sm
                leading-none
                text-white
                outline-none
                transition
                hover:border-white/10
                hover:bg-white/5
                focus:border-blue-400/50
                focus:bg-blue-500/10
                focus:ring-2
                focus:ring-blue-400/10
                disabled:cursor-not-allowed
              "
            />

            <span className="leading-none text-white/55">
              de {totalPdfPages}
            </span>
          </form>

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
        
          <div className="mx-4 h-6 w-px bg-white/20" />
            <button
              type="button"
              onClick={onToggleFullscreen}
              disabled={!onToggleFullscreen}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {isFullscreen ? "⤢" : "⛶"}
            </button>
          </div>

          {rightActions && (
            <div className="col-start-3 flex items-center justify-end gap-2">
              {rightActions}
            </div>
          )}

        </div>
    )
  }