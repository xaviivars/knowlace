"use client"

import { useEffect, useRef, useState } from "react"
import { Document, Page, pdfjs} from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

type PdfViewerProps = {
  pdfUrl: string
  pageNumber: number
  scale?: number
}

type PdfPageProxyLike = {
  getViewport: (params: { scale: number }) => {
    width: number
    height: number
  }
}

const HORIZONTAL_PADDING = 64
const VERTICAL_PADDING = 64
const MIN_PAGE_WIDTH = 320

export default function PdfViewer({
  pdfUrl,
  pageNumber,
  scale = 1,
}: PdfViewerProps) {

  const containerRef = useRef<HTMLDivElement>(null)

  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  })

  const [pageSize, setPageSize] = useState<{
    width: number
    height: number
  } | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    })

    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  function handlePageLoadSuccess(page: PdfPageProxyLike) {
    const viewport = page.getViewport({ scale: 1 })

    setPageSize({
      width: viewport.width,
      height: viewport.height,
    })
  }

  const availableWidth = Math.max(
    0,
    containerSize.width - HORIZONTAL_PADDING
  )

  const availableHeight = Math.max(
    0,
    containerSize.height - VERTICAL_PADDING
  )

  const pageAspectRatio = pageSize
    ? pageSize.width / pageSize.height
    : 16 / 9

  const isPortrait = pageSize
    ? pageSize.height > pageSize.width
    : false

  const fitPageWidth = Math.min(
    availableWidth,
    availableHeight * pageAspectRatio
  )

  const fitToWidth = availableWidth

  const basePageWidth = isPortrait
    ? fitToWidth
    : fitPageWidth

  const PORTRAIT_BASE_SCALE = 0.7

  const orientationBaseScale = isPortrait
    ? PORTRAIT_BASE_SCALE
    : 1

  const pageWidth = Math.max(
    MIN_PAGE_WIDTH,
    basePageWidth * orientationBaseScale * scale
  )

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full overflow-auto bg-[#0b162c]"
    >
      <div className="m-auto px-8 py-8">
        <Document
          file={pdfUrl}
          loading={<p className="text-white">Cargando PDF...</p>}
        >
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          onLoadSuccess={handlePageLoadSuccess}
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
        </Document>
      </div>
    </div>
  )
}