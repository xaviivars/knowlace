"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

export default function Join () {

    const [code, setCode] = useState("")
    const router = useRouter()

    const handleJoin = () => {
        if (!code.trim()) return

        router.push(`/session/${code.trim().toUpperCase()}`)
    }

    return (
        <div className="flex flex-col items-center gap-15 pt-32">
            
            <h1 className="text-6xl font-bold text-white">
                Knowlace.
            </h1>

            <div className="flex flex-row max-w-120">
                <Input 
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="bg-white/10 border border-white/20 w-80 text-center uppercase tracking-widest"
                    placeholder="Introduce un código de sesión"
                />

                <Button
                    onClick={handleJoin} 
                    className="w-80 h-12">
                    Unirse
                </Button>
            </div>
        </div>
    )

}