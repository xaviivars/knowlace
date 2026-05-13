"use client"

import { useEffect, useState } from "react"

export function useFullscreen<T extends HTMLElement>() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  async function enterFullscreen(element: T | null) {
    if (!element) return

    if (!document.fullscreenElement) {
      await element.requestFullscreen()
    }
  }

  async function exitFullscreen() {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }
  }

  async function toggleFullscreen(element: T | null) {
    if (document.fullscreenElement) {
      await exitFullscreen()
    } else {
      await enterFullscreen(element)
    }
  }

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}