import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import SessionClient from "./SessionClient"

export default async function PublicSessionPage({
  params,
}: {
  params: Promise<{ accessCode: string }>
}) {
  const { accessCode } = await params

  const normalizedCode = accessCode.toUpperCase()

  const session = await prisma.teachingSession.findUnique({
    where: {
      accessCode: normalizedCode,
    },
  })

  if (!session) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0e1d38] text-white flex flex-col items-center justify-center px-6">

      <SessionClient accessCode={normalizedCode} initialIsActive={session.isActive} />

      <div className="max-w-2xl w-full bg-[#142544] p-10 rounded-2xl shadow-2xl border border-white/10 text-center">

        <h1 className="text-4xl font-bold mb-4">
          {session.title}
        </h1>

        {session.description && (
          <p className="text-white/70 mb-8">
            {session.description}
          </p>
        )}
      </div>
    </div>
  )
}