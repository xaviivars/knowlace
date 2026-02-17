"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type SidebarItemProps = {
  href: string
  icon?: React.ElementType
  children: React.ReactNode
}

export function SidebarItem({
  href,
  icon: Icon,
  children,
}: SidebarItemProps) {
  const pathname = usePathname()
  const isActive =
  pathname === href ||
  pathname.startsWith(href + "/")

  return (
    <Link
      href={href}
      className={`
        w-full
        flex items-center gap-3
        px-4 py-3
        rounded-xl
        transition-all duration-200
        ${isActive
          ? "bg-white/15 text-white"
          : "hover:bg-white/10 text-white/80 hover:text-white"}
      `}
    >
      {Icon && <Icon className="w-5 h-5" />}
      <span className="font-medium">{children}</span>
    </Link>
  )
}
