"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "@/lib/actions/auth-actions"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import Link from 'next/link'

type LoginFormProps = {
  className?: string
}

export function LoginForm ({
  className = "",
}: LoginFormProps) {

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
            await signIn(email, password)
            router.push("/dashboard")
        } catch (err) {
            setError(
                err instanceof Error
                ? err.message
                : "Correo o contraseña incorrectos"
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
                h-120
                rounded-3xl
                p-8
                shadow-2xl
                ${className}
            `}
            >
                <div>
                    <h2 className="text-white font-bold text-4xl">
                        ¡Hola de nuevo!
                    </h2>
                    <p className="text-white py-2">
                        Te hemos estado esperando.
                    </p>
                </div>

                {error && (
                    <div className="mt-4 text-sm text-red-400">
                    {error}
                    </div>
                )}

                <div className="flex flex-col items-center gap-6 my-6">
                    <Input
                        label="Correo electrónico"
                        type="email"
                        placeholder="profesor@centro.com"
                        value={email}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setEmail(e.target.value)
                        }
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        placeholder="••••••••"
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
                        {isLoading ? "Iniciando..." : "Iniciar sesión"}
                    </Button>
                </div>

                <div className="mt-2 text-center text-sm text-white">
                    ¿No estás registrado?
                    <Link href="/register">
                        <span className="ml-1 underline cursor-pointer hover:text-blue-400 transition">
                        Crear cuenta
                        </span>
                    </Link>
                </div>
        </form>
    )
}
