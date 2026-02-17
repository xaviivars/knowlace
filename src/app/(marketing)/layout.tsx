export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">

      <header className="w-full h-18 border-b border-white/30 bg-[#0e1d38]">
        <div className="mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">
            Knowlace.
          </h1>

          <nav className="flex items-center gap-4 text-white text-sm">
              <span className="cursor-pointer font-bold hover:text-blue-400 transition">
                Introducir código
              </span>

              <span className="text-white/70 font-bold">|</span>

                <span className="cursor-pointer hover:text-blue-400 transition">
                  Acerca de
                </span>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

    </div>
  )
}
