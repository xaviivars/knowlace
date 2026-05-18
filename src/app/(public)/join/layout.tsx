import Link from "next/link"

export default function JoinLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0e1d38] text-white">
      <header className="h-18 shrink-0 border-b border-white/10 bg-[#0b1628]/95 backdrop-blur">
        <div className="flex h-full w-full items-center justify-between px-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white transition hover:text-blue-200"
          >
            Knowlace.
          </Link>

          <Link
            href="/login"
            className="
              inline-flex items-center justify-center rounded-xl
              border border-blue-400/20 bg-blue-500/10 px-4 py-2
              text-sm font-semibold text-blue-100 shadow-lg shadow-blue-950/20
              transition hover:border-blue-300/40 hover:bg-blue-500/20 hover:text-white
              active:scale-[0.98]
            "
          >
            Soy profesor
          </Link>
        </div>
      </header>

      <main className="relative flex min-h-0 flex-1 items-start justify-center overflow-hidden px-6 pt-45 pb-10">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 w-full">
          {children}
        </div>
      </main>
    </div>
  )
}