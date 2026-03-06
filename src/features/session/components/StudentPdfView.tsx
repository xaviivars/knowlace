"use client"

import dynamic from "next/dynamic"

const PdfViewer = dynamic(() => import("@/components/session/PdfViewer"), {
  ssr: false
})

type Props = {
  accessCode: string
  pageNumber: number
  onPageChange: (page: number) => void
}

export default function StudentPdfView({
  accessCode,
  pageNumber,
  onPageChange
}: Props) {

  return (
    <PdfViewer
      accessCode={accessCode}
      pageNumber={pageNumber}
      onPageChange={onPageChange}
      isOwner={false}
    />
  )

}