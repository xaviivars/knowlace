"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { signUp } from "@/features/auth/auth-actions"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { SocialAuthButton } from "./SocialAuthButton"
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
                relative
                w-120
                min-h-190
                rounded-3xl
                border border-white/15
                bg-white/[0.07]
                p-8
                shadow-2xl shadow-black/30
                backdrop-blur-2xl
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

            <div className="mt-3 min-h-10">
                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
                    {error}
                    </div>
                )}
            </div>
                
            <div className="flex flex-col items-center gap-5 mt-3 mb-5">
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

                <div className="my-6 flex items-center">
                    <div className="flex-1 border-t border-white/20"></div>
                        <span className="px-4 text-sm text-white/60">
                            O regístrate con
                        </span>
                    <div className="flex-1 border-t border-white/20"></div>
                </div>
                
                <div className="flex justify-center">
                    <SocialAuthButton provider="google" mode="register"/>  
                </div>

            
        </form>
    )

}