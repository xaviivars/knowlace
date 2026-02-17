type ButtonProps = {
  children: React.ReactNode
  className?: string
}

export function Button ({ children, className = "" }: ButtonProps) {
    return (
        <button
            className={`
                bg-amber-400
                text-black
                text-lg
                font-semibold
                rounded-full
                flex items-center justify-center
                shadow-lg
                transition-all duration-150 ease-in-out
                hover:bg-amber-500
                hover:shadow-xl
                active:scale-95
                active:shadow-md
                cursor-pointer
                ${className}
            `
            }
            >
      {children}
    </button>
  )
}
