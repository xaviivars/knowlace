import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e1d38] text-white">
      <DashboardSidebar 
        user={{
          name: session.user.name ?? "Usuario",
          email: session.user.email,
          image: session.user.image ?? null,
        }}
      />

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}