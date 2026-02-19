"use client"

import { SidebarItem } from "@/components/ui/SidebarItem"
import { Cog8ToothIcon, MagnifyingGlassIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";
import { signOut } from "@/lib/actions/auth-actions"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#0e1d38] text-white">
      
      <aside className="w-64 bg-[#0f1b2d] p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-8">Knowlace.</h2>

        <nav className="flex flex-col gap-4">
            <SidebarItem href="/dashboard" icon={SquaresPlusIcon}>
                Crear una sesión
            </SidebarItem>

            <SidebarItem href="/dashboard" icon={MagnifyingGlassIcon}>
                Buscar una sesión
            </SidebarItem>

            <SidebarItem href="/dashboard" icon={Cog8ToothIcon}>
                Ajustes
            </SidebarItem>
        </nav>

        <form action={signOut}>
          <button
            type="submit"
            className="w-full mt-8 bg-red-500 hover:bg-red-600 transition p-3 rounded-xl font-semibold"
          >
            Cerrar sesión
          </button>
        </form>

      </aside>

      <main className="flex-1 p-12">
        {children}
      </main>

    </div>
  )
}
