type StatCardProps = {
  label: string
  value: string | number
  helper?: string
  variant?: "default" | "success" | "warning" | "danger"
}

const variantClasses = {
  default: "border-white/10 bg-white/5 text-white",
  success: "border-green-500/20 bg-green-500/10 text-green-200",
  warning: "border-yellow-500/20 bg-yellow-500/10 text-yellow-100",
  danger: "border-red-500/20 bg-red-500/10 text-red-200",
}

export function ResultStatCard({
  label,
  value,
  helper,
  variant = "default",
}: StatCardProps) {
  return (
    <div
      className={`rounded-2xl border px-5 py-4 text-center shadow-sm ${variantClasses[variant]}`}
    >
      <p className="text-sm text-white/50">{label}</p>

      <p className="mt-1 text-3xl font-bold text-white">
        {value}
      </p>

      {helper && (
        <p className="mt-1 text-xs text-white/40">
          {helper}
        </p>
      )}
    </div>
  )
}