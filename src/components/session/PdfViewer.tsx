"use client"

import { useState } from "react"
import { Document, Page, pdfjs} from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

export default function PdfViewer() {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState(1)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  return (
    <div className="relative w-full h-full bg-[#0b162c] flex flex-col items-center">

      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded flex gap-4 items-center z-10">
        <button
          onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
          className="px-3 py-1 bg-white/20 rounded hover:bg-white/30"
        >
          ◀
        </button>

        <span className="text-sm">
          Página {pageNumber} {numPages && `de ${numPages}`}
        </span>

        <button
          onClick={() =>
            setPageNumber((prev) =>
              numPages ? Math.min(prev + 1, numPages) : prev
            )
          }
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