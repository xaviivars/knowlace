"use client"

import { getSocket } from "@/lib/socket"
import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { QuestionView } from "@/components/session/teacher/QuestionView"

const PdfViewer = dynamic(() => import("../PdfViewer"), { ssr: false })

type QuestionWithOptions = {
  id: string
  content: string
  pageNumber: number
  options: {
    id: string
    content: string
    isCorrect: boolean
  }[]
}

export default function OwnerSessionPresentation({
  accessCode,
  initialPage,
  isOwner,
  questions,
}: {
  accessCode: string
  initialPage: number
  isOwner: boolean
  questions: QuestionWithOptions[]
}) {

  const [pageNumber, setPageNumber] = useState(initialPage)

  const currentQuestion = questions.find(
    q => q.pageNumber === pageNumber
  )

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
      {currentQuestion ? (
        <QuestionView question={currentQuestion} isOwner={isOwner} onNext={() => handlePageChange(pageNumber + 1)} />
      ) : (
          <PdfViewer
            accessCode={accessCode}
            pageNumber={pageNumber}
            onPageChange={handlePageChange}
            isOwner={true}
          />
      )}
    </div>
  )
}