type ButtonProps = {
  children: React.ReactNode
}

export function Button ({ children }: ButtonProps) {
    return (
        <button
            className="
                w-80
                h-12
                mx-auto
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
            "
            >
      {children}
    </button>
  )
}
