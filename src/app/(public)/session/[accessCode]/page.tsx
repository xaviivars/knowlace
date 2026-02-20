import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function PublicSessionPage({
  params,
}: {
  params: Promise<{ accessCode: string }>
}) {
  const { accessCode } = await params

  const session = await prisma.teachingSession.findUnique({
    where: {
      accessCode: accessCode.toUpperCase(),
    },
  })

  if (!session) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0e1d38] text-white flex flex-col items-center justify-center px-6">

      <div className="max-w-2xl w-full bg-[#142544] p-10 rounded-2xl shadow-2xl border border-white/10 text-center">

        <h1 className="text-4xl font-bold mb-4">
          {session.title}
        </h1>

        {session.description && (
          <p className="text-white/70 mb-8">
            {session.description}
          </p>
        )}

        {!session.isActive ? (
          <div className="text-white/50 text-sm">
            Esperando a que el profesor inicie la sesión...
          </div>
        ) : (
          <div className="text-green-400 font-semibold">
            La sesión ha comenzado 🎉
          </div>
        )}

      </div>
    </div>
  )
}