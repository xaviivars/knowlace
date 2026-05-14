import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
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
    <div className="flex h-screen overflow-hidden bg-[#0e1d38] text-white">
      <DashboardSidebar 
        user={{
          name: user.name ?? "Usuario",
          email: user.email,
          image: user.image ?? null,
        }}
      />

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}