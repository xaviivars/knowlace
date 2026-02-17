import { Button } from "../ui/Button"
import Link from 'next/link'

export function HeroCTA() {

    return (
        <div className="bg-[#0e1d38] w-120 h-60 rounded-3xl p-6 shadow-2xl">

          <div className="mb-6">
            <h2 className="text-white text-4xl font-bold">
              Empieza ahora.
            </h2>
            <p className="text-white/80 text-lg mt-3">
              
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 mt-12">
            <Link href="/login">
              <Button className="w-80 h-12">
                Iniciar sesión como profesor
              </Button>
            </Link>
          </div>
          <div className="mt-4 text-center text-sm text-white">
            ¿No estás registrado?
            <Link href="/register">
              <span className="ml-1 underline cursor-pointer hover:text-blue-400 transition">
                Crear cuenta
              </span>
            </Link>
          </div>
        </div>
    )

}