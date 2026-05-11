type AppBackgroundProps = {
  children: React.ReactNode
  className?: string
}

export function AppBackground({ children, className = "" }: AppBackgroundProps) {
  return (
    <div className={`min-h-screen bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] text-slate-100 ${className}`}>
      {children}
    </div>
  )
}