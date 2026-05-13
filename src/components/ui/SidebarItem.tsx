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
      title={collapsed && typeof children === "string" ? children : undefined}
      className={`
        flex
        h-12
        w-full
        items-center 
        px-3
        overflow-hidden
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
    </Link>
  )
}
