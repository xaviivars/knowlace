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
          transition-all duration-300 ease-in-out
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
              className="group relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
            >
              {isSidebarCollapsed ? (
                <span className="relative flex h-10 w-10 items-center justify-center">
                  <img
                    src="/assets/images/k_dot_48.svg"
                    alt=""
                    className="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 opacity-80 transition-opacity duration-200 group-hover:opacity-0"
                  />

                  <Bars3BottomLeftIcon className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                </span>
              ) : (
                <Bars3BottomLeftIcon className="h-7 w-7" />
              )}

              <span
                className="
                  pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2
                  whitespace-nowrap rounded-xl border border-white/10 bg-[#142544] px-3 py-2
                  text-sm font-medium text-white opacity-0 shadow-xl shadow-black/30
                  transition-all duration-150
                  group-hover:translate-x-1 group-hover:opacity-100
                "
              >
                {isSidebarCollapsed ? "Expandir barra lateral" : "Contraer barra lateral"}
              </span>
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
              href="/dashboard/settings" 
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
