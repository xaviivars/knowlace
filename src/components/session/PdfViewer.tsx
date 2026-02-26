"use client"

import { useState } from "react"
import { Document, Page, pdfjs} from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

type PdfViewerProps = {
  accessCode: string
  pageNumber: number
  onPageChange: (page: number) => void
  isOwner: boolean
}

export default function PdfViewer({
  accessCode,
  pageNumber,
  onPageChange,
  isOwner,
}: PdfViewerProps) {

  const [numPages, setNumPages] = useState<number | null>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  const handlePrev = () => {
    const newPage = Math.max(pageNumber - 1, 1)
    onPageChange(newPage)
  }

  const handleNext = () => {
    if (!numPages) return
    const newPage = Math.min(pageNumber + 1, numPages)
    onPageChange(newPage)
  }

  return (
    <div className="relative w-full h-full bg-[#0b162c] flex flex-col items-center">

        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded flex gap-4 items-center z-10">
          <button
            onClick={handlePrev}
            className="px-3 py-1 bg-white/20 rounded hover:bg-white/30"
          >
            ◀
          </button>

          <span className="text-sm text-white">
            Página {pageNumber} {numPages && `de ${numPages}`}
          </span>

          <button
            onClick={handleNext}
            className="px-3 py-1 bg-white/20 rounded hover:bg-white/30"
          >
            ▶
          </button>
        </div>

      <div className="flex-1 flex items-center justify-center w-full overflow-auto">
        <Document
          file="/lorem_ipsum.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<p className="text-white">Cargando PDF...</p>}
        >
          <Page
            pageNumber={pageNumber}
            width={1000}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  )
}