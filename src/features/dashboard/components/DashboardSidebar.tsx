"use client"

import { useState } from "react"
import Link from "next/link"
import { SidebarItem } from "@/components/ui/SidebarItem"
import { signOut } from "@/features/auth/auth-actions"
import {
  Cog8ToothIcon,
  MagnifyingGlassIcon,
  SquaresPlusIcon,
  Bars3BottomLeftIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from "@heroicons/react/24/outline"

type DashboardSidebarProps = {
  user: {
    name: string
    email: string
    image: string | null
  }
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)

  return (
    <aside
      className={`
        flex shrink-0 flex-col border-r border-white/10 bg-[#0b1628] px-5 py-6
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
            aria-label={
              isSidebarCollapsed
                ? "Expandir barra lateral"
                : "Contraer barra lateral"
            }
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
              {isSidebarCollapsed
                ? "Expandir barra lateral"
                : "Contraer barra lateral"}
            </span>
          </button>
        </div>
      </div>

      <nav className="mt-6 flex flex-col gap-4">
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

      <div className="relative mt-auto border-t border-white/10 pt-5">
        {isProfileMenuOpen && (
          <div
            className={`
              absolute z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#142544] p-1.5 shadow-2xl shadow-black/30
              ${
                isSidebarCollapsed
                  ? "bottom-full left-0 mb-3 w-56"
                  : "bottom-full left-0 right-0 mb-3"
              }
            `}
          >
            <Link
              href="/dashboard/settings"
              onClick={() => setIsProfileMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            >
              <UserCircleIcon className="h-5 w-5 shrink-0 text-white/45" />
              Perfil
            </Link>

            <div className="my-1 h-px bg-white/10" />

            <form action={signOut}>
              <button
                type="submit"
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 shrink-0" />
                Cerrar sesión
              </button>
            </form>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          className={`
            group relative flex w-full cursor-pointer items-center rounded-2xl transition hover:bg-white/5
            ${isSidebarCollapsed ? "justify-center p-2" : "gap-3 p-2.5"}
          `}
          aria-label="Abrir menú de perfil"
        >
          {user.image ? (
            <img
              src={user.image}
              alt=""
              referrerPolicy="no-referrer"
              className="h-10 w-10 rounded-full object-cover"
              onError={(event) => {
                console.error("Error cargando imagen de perfil:", user.image)
                event.currentTarget.style.display = "none"
              }}
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-sm font-bold text-blue-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          {!isSidebarCollapsed && (
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-semibold text-white">
                {user.name}
              </p>

              <p className="truncate text-xs text-white/45">
                {user.email}
              </p>
            </div>
          )}

          {isSidebarCollapsed && !isProfileMenuOpen && (
            <span
              className="
                pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2
                whitespace-nowrap rounded-xl border border-white/10 bg-[#142544] px-3 py-2
                text-sm font-medium text-white opacity-0 shadow-xl shadow-black/30
                transition-all duration-150
                group-hover:translate-x-1 group-hover:opacity-100
              "
            >
              {user.name}
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}