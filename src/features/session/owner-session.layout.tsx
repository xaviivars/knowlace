"use client"

import SessionControls from "@/features/session/components/teacher/SessionControls"
import OwnerSessionPresentation from "@/features/session/components/teacher/OwnerSessionPresentation"

export default function OwnerSessionLayout({
  sessionId,
  accessCode,
  title,
  description,
  isActive,
  slides,
  pdfUrl,
  initialSlideIndex
}: {
  sessionId: string
  accessCode: string
  title: string
  description: string | null
  isActive: boolean
  initialSlideIndex: number
  slides: any
  pdfUrl: string
}) {

  return (
    <div className="flex flex-col h-full w-full bg-[#0e1d38] text-white">

      <header className="border-b border-white/20 px-6 py-4">
        <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
          <p className="text-white/60">{description}</p>
          )}
      </header>

      <div className="border-b border-white/10 px-8 py-4">
        <SessionControls
          sessionId={sessionId}
          accessCode={accessCode}
          initialIsActive={isActive}
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <OwnerSessionPresentation
          accessCode={accessCode}
          isOwner={true}
          slides={slides}
          pdfUrl={pdfUrl}
          initialSlideIndex={initialSlideIndex}
        />
      </div>

    </div>
  )
}