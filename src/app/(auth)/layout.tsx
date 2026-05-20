export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#071426] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_32%),radial-gradient(circle_at_80%_15%,rgba(34,211,238,0.14),transparent_28%),radial-gradient(circle_at_55%_85%,rgba(37,99,235,0.18),transparent_34%)]" />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-size-[48px_48px] opacity-35" />

      <div className="pointer-events-none absolute -left-30 top-24 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-30 -right-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="pointer-events-none absolute right-[12%] top-[18%] hidden lg:block">
        <div className="relative h-56 w-80">
          <div className="absolute left-0 top-20 h-px w-72 rotate-[-18deg] bg-linear-to-r from-transparent via-white/25 to-transparent" />
          <div className="absolute right-4 top-8 rotate-12 text-white/25">
            <PaperPlaneIcon />
          </div>
        </div>
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        {children}
      </main>
    </div>
  )
}

function PaperPlaneIcon() {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M82 16L14 46.5L43 55L54 82L82 16Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M43 55L82 16L54 82"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}