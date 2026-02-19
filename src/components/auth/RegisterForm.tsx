"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { signUp } from "@/lib/actions/auth-actions"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import Link from 'next/link'

type RegisterFormProps = {
  className?: string
}

export function RegisterForm ({
    className = "",
}: RegisterFormProps) {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            await signUp(email, password, name)
            router.push("/dashboard")
        } catch (err) {
            setError(
                err instanceof Error
                ? err.message
                : "No se pudo crear la cuenta"
            )
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
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
                <h2 className="text-white font-bold text-4xl">
                    Crea tu cuenta
                </h2>
                <p className="text-white py-2">
                    Empieza a crear sesiones interactivas en minutos.
                </p>
            </div>    

            {error && (
                <div className="mt-4 text-sm text-red-400">
                {error}
                </div>
            )}

            <div className="flex flex-col items-center gap-5 my-4">
                <Input
                    label="Nombre"
                    type="text"
                    placeholder="John"
                    required
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setName(e.target.value)
                    }
                />

                <Input
                    label="Correo electrónico"
                    type="email"
                    placeholder="profesor@centro.com"
                    required
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setEmail(e.target.value)
                    }
                />

                <Input
                    label="Contraseña"
                    type="text"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                    }
                />

                <Button 
                    type="submit"
                    disabled={isLoading}
                    className="w-80 h-12"
                >
                    {isLoading ? "Creando cuenta..." : "Registrarse"}
                </Button>

                <div className="text-center mb-1 text-sm text-white">
                    ¿Ya estás registrado?
                    <Link href="/login">
                        <span className="ml-1 underline cursor-pointer hover:text-blue-400 transition">
                        Inicia sesión.
                        </span>
                    </Link>
                </div>
            </div>
        </form>
    )

}