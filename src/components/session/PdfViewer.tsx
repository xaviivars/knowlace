"use client"

import { useState } from "react"

export default function PdfViewer() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div className="relative w-full h-full">

      <div
        className={`
          w-full
          h-full
          bg-white
          text-black
          shadow-2xl
          transition-all
          duration-300
          ${isFullscreen ? "rounded-none" : ""}
        `}
      >
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-3xl font-semibold">
            Aquí se está mostrando el PDF
          </span>
        </div>
      </div>

      <button
        onClick={() => setIsFullscreen(!isFullscreen)}
        className="absolute top-6 right-6 bg-black/60 text-white px-4 py-2 rounded hover:bg-black/80 transition"
      >
        {isFullscreen ? "Salir fullscreen" : "Fullscreen"}
      </button>

    </div>
  )
}