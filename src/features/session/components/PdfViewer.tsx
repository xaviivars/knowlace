"use client"

import { useState } from "react"
import { Document, Page, pdfjs} from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

type PdfViewerProps = {
  fileUrl: string
  pageNumber: number
}

export default function PdfViewer({
  fileUrl,
  pageNumber,
}: PdfViewerProps) {

  const [numPages, setNumPages] = useState<number | null>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  return (
    <div className="relative w-full h-full bg-[#0b162c] flex flex-col items-center">

      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/60 px-4 py-2 rounded flex gap-4 items-center z-10">
        <span className="text-sm text-white">
          Página {pageNumber} {numPages && `de ${numPages}`}
        </span>
      </div>

      <div className="h-full w-full overflow-auto flex justify-center">
        <Document
          file={fileUrl}
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