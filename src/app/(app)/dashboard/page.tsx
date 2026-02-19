"use server"

import { Button } from "@/components/ui/Button"

export default async function Dashboard () {

    return (
        <div className="min-h-screen bg-[#0e1d38] text-white p-4">

            <h1 className="text-4xl font-bold mb-6">
                Bienvenido, Xavier
            </h1>

            <p className="text-lg mb-4">
            Esto está muy vacío... :(
            </p>
            <div className="flex flex-col ">
                <Button className="w-80 h-12">
                    Crear sesión
                </Button>
            </div>
        </div>
    )

}