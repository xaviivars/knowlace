import React from "react"

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

const Input = ({ label, error, className = "", ...props }: InputProps) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      
      {label && (
        <label className="text-sm text-white/80 font-medium">
          {label}
        </label>
      )}

      <input
        className={`
          bg-[#18263f]
          border border-white/20
          rounded-xl
          px-4 py-3
          text-white
          placeholder-white/40
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          transition
          ${error ? "border-red-500 focus:ring-red-500" : ""}
          ${className}
        `}
        {...props}
      />

      {error && (
        <span className="text-sm text-red-400">
          {error}
        </span>
      )}
    </div>
  )
}

export default Input
