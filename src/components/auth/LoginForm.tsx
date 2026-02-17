import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

type LoginFormProps = {
  className?: string
}

export function LoginForm ({
  className = "",
}: LoginFormProps) {
    return (
        <div
            className={`
                bg-[#0f1b2d]
                w-120
                h-120
                rounded-3xl
                p-8
                shadow-2xl
            ${className}
            `}
            >

                <div>
                    <h2 className="text-white font-bold text-4xl">¡Hola de nuevo!</h2>
                    <p className="text-white py-2">Te hemos estado esperando.</p>
                </div>

                <div className="flex flex-col gap-6 my-6">
                    <Input
                        label="Correo electrónico"
                        type="email"
                        placeholder="profesor@centro.com"
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
                    />

                    <Button>
                        Iniciar sesión
                    </Button>
                </div>

                <div className="mt-2 text-center text-sm text-white">
                    ¿No estás registrado?
                    <span className="ml-1 underline cursor-pointer hover:text-blue-400 transition">
                    Crear cuenta
                    </span>
                </div>
        </div>
    )
}
