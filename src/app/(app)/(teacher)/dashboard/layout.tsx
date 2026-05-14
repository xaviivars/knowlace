import DashboardSidebar from "@/features/dashboard/components/DashboardSidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#0e1d38] text-white">
      <DashboardSidebar />

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  )
}