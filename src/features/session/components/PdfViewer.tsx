"use client"

import { useState } from "react"
import { Document, Page, pdfjs} from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString()

type PdfViewerProps = {
  pdfUrl: string
  pageNumber: number
}

export default function PdfViewer({
  pdfUrl,
  pageNumber,
}: PdfViewerProps) {

  const [numPages, setNumPages] = useState<number | null>(null)

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages)
  }

  return (

      <div className="flex h-full w-full justify-center overflow-auto bg-[#0b162c]">
        <Document
          file={pdfUrl}
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
  )
}