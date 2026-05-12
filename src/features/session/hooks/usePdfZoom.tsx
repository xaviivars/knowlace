"use client"

import { useState } from "react"

const MIN_SCALE = 0.7
const MAX_SCALE = 1.8
const SCALE_STEP = 0.1

export function usePdfZoom() {
  const [scale, setScale] = useState(1)

  function zoomIn() {
    setScale((currentScale) =>
      Math.min(MAX_SCALE, Number((currentScale + SCALE_STEP).toFixed(2)))
    )
  }

  function zoomOut() {
    setScale((currentScale) =>
      Math.max(MIN_SCALE, Number((currentScale - SCALE_STEP).toFixed(2)))
    )
  }

  function resetZoom() {
    setScale(1)
  }

  return {
    scale,
    zoomPercentage: Math.round(scale * 100),
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn: scale < MAX_SCALE,
    canZoomOut: scale > MIN_SCALE,
  }
}