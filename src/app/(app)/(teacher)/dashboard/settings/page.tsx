import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { SettingsPanel } from "@/features/settings/components/SettingsPanel"

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


  return (
    <SettingsPanel
      user={{
        name: user.name ?? "Usuario",
        email: user.email,
        image: user.image ?? null,
      }}
    />
  )
}