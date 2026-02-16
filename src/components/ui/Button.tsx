type ButtonProps = {
  children: React.ReactNode
}

const Button = ({ children }: ButtonProps) => {

    return (
        <button className="w-80 h-12 mx-auto bg-amber-400 rounded-4xl flex items-center justify-center
                       font-semibold text-black text-lg">
            {children}
        </button>
    )

}

export default Button