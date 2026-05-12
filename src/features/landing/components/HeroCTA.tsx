import { Button } from "@/components/ui/Button"
import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline"

export function HeroCTA() {
  return (
    <div className="w-120 rounded-3xl border border-white/10 bg-[#0e1626]/95 p-7 shadow-2xl backdrop-blur">

      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Prepara tu próxima sesión.
        </h2>

        <p className="mt-3 text-base leading-relaxed text-white/65">
          Sube tu PDF, genera preguntas con IA y comparte una sesión interactiva con tus alumnos.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {[
          "Presenta tu material en directo",
          "Crea preguntas interactivas",
          "Recibe respuestas en tiempo real",
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm text-white/70">
            <CheckCircleIcon className="h-5 w-5 text-blue-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <Link href="/login" className="block">
          <Button className="flex h-12 w-full items-center justify-center gap-2">
            Entrar al panel
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </Link>

        <p className="text-center text-sm text-white/55">
          ¿Todavía no tienes cuenta?
          <Link href="/register">
            <span className="ml-1 font-medium text-blue-300 underline-offset-4 transition hover:text-blue-200 hover:underline">
              Crear cuenta
            </span>
          </Link>
        </p>
      </div>
    </div>
  )
}