"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type SidebarItemProps = {
  href: string
  icon?: React.ElementType
  children: React.ReactNode
  collapsed?: boolean
}

export function SidebarItem({
  href,
  icon: Icon,
  children,
  collapsed = false,
}: SidebarItemProps) {

  const pathname = usePathname()
  
  const isActive =
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      aria-label={collapsed && typeof children === "string" ? children : undefined}
      className={`
        group relative
        flex
        h-12
        w-full
        items-center 
        px-3
        overflow-visible
        rounded-xl
        transition-all duration-200
        ${isActive
          ? "bg-white/15 text-white"
          : "hover:bg-white/10 text-white/80 hover:text-white"}
      `}
    >
      <span className="flex h-7 w-7 shrink-0 items-center justify-center">
        {Icon && (
          <Icon className="h-7 w-7 shrink-0" />
        )}
      </span>
      
      <span
        className={`
          whitespace-nowrap font-medium transition-all duration-200 ease-in-out
          ${
            collapsed
              ? "ml-0 w-0 opacity-0"
              : "ml-3 w-44 opacity-100"
          }
        `}
      >
        {children}
      </span>

      {collapsed && typeof children === "string" && (
        <span
          className="
            pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2
            whitespace-nowrap rounded-xl border border-white/10 bg-[#142544] px-3 py-2
            text-sm font-medium text-white opacity-0 shadow-xl shadow-black/30
            transition-all duration-150
            group-hover:translate-x-1 group-hover:opacity-100
          "
        >
          {children}
        </span>
      )}
    </Link>
  )
}
