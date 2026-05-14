import { auth } from "@/lib/auth"
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

  return (
    <SettingsPanel
      user={{
        name: session.user.name ?? "",
        email: session.user.email,
      }}
    />
  )
}