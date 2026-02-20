import { prisma } from "@/lib/prisma"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = await params

  const session = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
  })

  if (!session) {
    return <div>Sesión no encontrada</div>
  }

  return (
    <div>
      <h1>{session.title}</h1>
      <h1>{session.description}</h1>
    </div>
  )
}