import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

type RegisterFormProps = {
  className?: string
}

export function RegisterForm ({
    className = "",
}: RegisterFormProps) {
    return (
        <div
            className={`
                bg-[#0f1b2d]
                w-120
                h-160
                rounded-3xl
                p-8
                shadow-2xl
                ${className}
                `}
            >

                <div>
                    <h2 className="text-white font-bold text-4xl">Crea tu cuenta</h2>
                    <p className="text-white py-2">Empieza a crear sesiones interactivas en minutos.</p>
                </div>    

                <div className="flex flex-col gap-5 my-4">
                    <Input
                        label="Nombre"
                        type="text"
                        placeholder="John"
                    />

                    <Input
                        label="Correo electrónico"
                        type="email"
                        placeholder="profesor@centro.com"
                    />

                    <Input
                        label="Contraseña"
                        type="text"
                        placeholder="Doe"
                    />

                    <Input
                        label="Nombre de usuario"
                        type="text"
                        placeholder="john_doe"
                    />

                    <Button>
                        Registrarse
                    </Button>

                    <div className="text-center mb-1 text-sm text-white">
                        ¿Ya estás registrado?
                        <span className="ml-1 underline cursor-pointer hover:text-blue-400 transition">
                        Inicia sesión.
                        </span>
                    </div>
            </div>
        
        </div>
    )

}