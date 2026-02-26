"use client"

import { getSocket } from "@/lib/socket"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"

const PdfViewer = dynamic(() => import("./PdfViewer"), { ssr: false })

export default function SessionPresentation({
  accessCode,
  initialPage,
}: {
  accessCode: string
  initialPage: number
}) {

  const [pageNumber, setPageNumber] = useState(initialPage)

    useEffect(() => {
      const socket = getSocket()

      socket.emit("owner-join", accessCode)

      socket.on("page-updated", (newPage: number) => {
        setPageNumber(newPage)
      })

      return () => {
        socket.off("page-updated")
      }
    }, [accessCode])

    const handlePageChange = (newPage: number) => {
      setPageNumber(newPage)

    const socket = getSocket()
        socket.emit("page-changed", newPage)
    }

  return (
    <div className="flex-1 bg-[#0b162c]">
      <PdfViewer
        accessCode={accessCode}
        pageNumber={pageNumber}
        onPageChange={handlePageChange}
        isOwner={true}
      />
    </div>
  )
}