import { ReactNode } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export default async function AppLayout({
  children,
}: {
  children: ReactNode
}) {
    
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {children}
    </div>
  )
}
