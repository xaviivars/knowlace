type SpinnerProps = {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function Spinner({ size = "sm", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <span
      className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-white/30 border-t-white ${className}`}
    />
  )
}