"use client"

import { useState } from "react";
import { SidebarItem } from "@/components/ui/SidebarItem"
import { signOut } from "@/features/auth/auth-actions"
import { 
  Cog8ToothIcon, 
  MagnifyingGlassIcon, 
  SquaresPlusIcon,
  Bars3BottomLeftIcon,
  ArrowRightOnRectangleIcon,
 } from "@heroicons/react/24/outline";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e1d38] text-white">
      
      <aside
        className={`
          shrink-0 border-r border-white/10 bg-[#0b1628] px-5 py-6 flex flex-col
          transition-all duration-300 ease-in-out overflow-hidden
          ${isSidebarCollapsed ? "w-24" : "w-72"}
        `}
      >

        <div className="border-b border-white/10 pb-6">
          <div
            className={`
              flex items-center
              ${isSidebarCollapsed ? "justify-center" : "justify-between"}
            `}
          >
            {!isSidebarCollapsed && (
              <h2 className="text-4xl font-bold tracking-tight">
                Knowlace.
              </h2>
            )}

            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
              title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
            >
              <Bars3BottomLeftIcon className="h-7 w-7" />
            </button>
          </div>
        </div>

        <nav className="flex flex-col gap-4 mt-6">
            <SidebarItem 
              href="/dashboard/sessions/new" 
              icon={SquaresPlusIcon} 
              collapsed={isSidebarCollapsed}
            >
              Crear una sesión
            </SidebarItem>

            <SidebarItem 
              href="/dashboard" 
              icon={MagnifyingGlassIcon} 
              collapsed={isSidebarCollapsed}
            >
              Buscar una sesión
            </SidebarItem>

            <SidebarItem 
              href="/dashboard/working" 
              icon={Cog8ToothIcon}
              collapsed={isSidebarCollapsed}
            >
              Ajustes
            </SidebarItem>
        </nav>

         <div className="mt-auto border-t border-white/10 pt-5">
          <form action={signOut}>
            <button
              type="submit"
              className={`
                flex w-full items-center justify-center gap-3 rounded-xl border border-red-500/20
                bg-red-500/10 p-3 font-semibold text-red-300 transition
                hover:bg-red-500/15 hover:text-red-200
                ${isSidebarCollapsed ? "px-0" : ""}
              `}
            > 
              <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />

              {!isSidebarCollapsed && (
                <span>
                  Cerrar sesión
                </span>
              )}
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
