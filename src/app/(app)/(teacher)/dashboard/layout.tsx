"use client"

import { SidebarItem } from "@/components/ui/SidebarItem"
import { Cog8ToothIcon, MagnifyingGlassIcon, SquaresPlusIcon } from "@heroicons/react/24/outline";
import { signOut } from "@/features/auth/auth-actions"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0e1d38] text-white">
      
      <aside className="w-72 shrink-0 border-r border-white/10 bg-[#0b1628] px-5 py-6 flex flex-col">
        <h2 className="text-4xl font-bold mb-12">Knowlace.</h2>

        <nav className="flex flex-col gap-4">
            <SidebarItem href="/dashboard/sessions/new" icon={SquaresPlusIcon}>
                Crear una sesión
            </SidebarItem>

            <SidebarItem href="/dashboard" icon={MagnifyingGlassIcon}>
                Buscar una sesión
            </SidebarItem>

            <SidebarItem href="/dashboard" icon={Cog8ToothIcon}>
                Ajustes
            </SidebarItem>
        </nav>

         <div className="mt-auto border-t border-white/10 pt-5">
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-xl border border-red-500/20 bg-red-500/10 p-3 font-semibold text-red-300 transition hover:bg-red-500/15 hover:text-red-200"
            >
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>

    </div>
  )
}
