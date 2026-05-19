import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SettingsPanel } from "@/features/settings/components/SettingsPanel"
import { getAiUsageSummary } from "@/features/ai/ai-usage-service"

export default async function SettingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      name: true,
      email: true,
      image: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  const aiUsage = await getAiUsageSummary(session.user.id)

  const archivedSessions = await prisma.teachingSession.findMany({
    where: {
      ownerId: session.user.id,
      isArchived: true,
    },
    orderBy: {
      archivedAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      accessCode: true,
      pdfPages: true,
      createdAt: true,
      archivedAt: true,
    },
  })

  return (
    <SettingsPanel
      user={{
        name: user.name ?? "Usuario",
        email: user.email,
        image: user.image ?? null,
      }}
      aiUsage={{
        ...aiUsage,
        periodStart: aiUsage.periodStart.toISOString(),
        periodEnd: aiUsage.periodEnd.toISOString(),
      }}
      archivedSessions={archivedSessions.map((session) => ({
        ...session,
        createdAt: session.createdAt.toISOString(),
        archivedAt: session.archivedAt?.toISOString() ?? null,
      }))}
    />
  )
}