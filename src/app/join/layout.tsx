import Link from "next/link"

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen bg-[#1a3972]">

      <header className="w-full h-18 border-b border-white/30 bg-[#0e1d38]">
        <div className="max-w-6xl px-6 h-full flex items-center justify-between">

          <Link href="/">
            <h1 className="text-2xl font-bold text-white">
              Knowlace.
            </h1>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex justify-center">
        {children}
      </main>
      
    </div>
  )
}