"use client"

import dynamic from "next/dynamic"

const PdfViewer = dynamic(() => import("@/features/session/components/PdfViewer"), {
  ssr: false
})

type Props = {
  accessCode: string
  pdfUrl: string
  pageNumber: number
  scale?: number
}

export default function StudentPdfView({
  pdfUrl,
  pageNumber,
  scale = 1,
}: Props) {

  return (
    <PdfViewer
      pdfUrl={pdfUrl}
      pageNumber={pageNumber}
      scale={scale}
    />
  )

}