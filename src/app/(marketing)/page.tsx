"use client"

import { useState, useEffect } from "react"

import { HeroCTA } from '@/features/landing/components/HeroCTA'
import FeatureCard from "@/features/landing/components/FeatureCard";
import { BoltIcon, ClockIcon, EyeIcon, XMarkIcon, SparklesIcon, RocketLaunchIcon } from "@heroicons/react/24/outline";

export default function Home () {

  const [showJoinBar, setShowJoinBar] = useState(true)

  const [showScrollHint, setShowScrollHint] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollHint(window.scrollY < 80)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-[#081120] via-[#0d1830] to-[#111c38]">
      <header
        className={`
          relative z-20 w-full bg-linear-to-r from-[#c3ceec] via-[#b8c9f3] to-[#c3ceec]
          shadow-lg transition-all duration-500 ease-out
          ${showJoinBar ? "h-16 opacity-100" : "h-0 opacity-0"}
        `}
      >
        <div className="mx-auto flex h-full max-w-7xl items-center justify-center px-6">
          <div className="flex items-center gap-4">
            <SparklesIcon className="h-5 w-5 text-blue-600" />

            <span className="text-sm font-semibold text-slate-800">
              Introduce un código para unirte a una sesión existente
            </span>

            <input
              placeholder="Código"
              className="h-10 w-36 rounded-xl border-2 border-blue-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500"
            />

            <button className="flex h-10 items-center justify-center rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-lg">
              Unirse
            </button>
          </div>

          <button
            onClick={() => setShowJoinBar(false)}
            className="absolute right-6 text-gray-700 transition hover:scale-110 hover:text-gray-900"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="pointer-events-none absolute right-30 top-35 h-105 w-105 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 top-65 h-80 w-[320px] rounded-full bg-purple-500/10 blur-3xl" />

      <main className="relative z-10">
        <section className="relative mx-auto flex min-h-[80vh] max-w-362.5 flex-col items-center gap-10 px-8 py-20 lg:flex-row lg:items-center lg:justify-between xl:px-14">
          <div className="flex max-w-3xl flex-[1.05] flex-col gap-10">
            <div className="space-y-7">
              <div className="inline-flex">
                <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-linear-to-r from-blue-500/10 to-purple-500/10 px-5 py-2 text-sm font-semibold text-white shadow-lg backdrop-blur-md">
                  <RocketLaunchIcon className="h-4 w-4" />
                  Presentaciones interactivas en tiempo real
                </span>
              </div>

              <h1 className="bg-linear-to-r from-white via-white to-white/80 bg-clip-text text-6xl font-extrabold leading-[1.05] text-transparent md:text-7xl lg:text-[5.3rem]">
                Enseña como siempre.
                <br />
                <span className="bg-linear-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                  Llega como nunca.
                </span>
              </h1>

              <p className="max-w-2xl text-xl leading-relaxed text-white/80 md:text-2xl">
                Dale un ritmo diferente a la docencia mediante las
                presentaciones interactivas de{" "}
                <span className="font-bold text-white">Knowlace</span>.
              </p>
            </div>

            <div className="flex flex-wrap gap-5">

              <button className="rounded-2xl border-2 border-white/20 bg-white/5 px-8 py-4 text-lg font-bold text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:border-white/30 hover:bg-white/10">
                Ver demo
              </button>
            </div>
          
          </div>

          <div className="flex w-full flex-[1.3] items-center justify-center lg:justify-end">
            <div className="relative scale-110 lg:scale-[1.2] translate-y-4 lg:translate-y-8">

              {/* Glow background */}
              <div className="absolute inset-0 scale-125 rounded-[3rem] bg-linear-to-br from-blue-500/30 via-cyan-400/20 to-purple-500/30 blur-3xl" />

              {/* CTA */}
              <div className="relative">
                <HeroCTA />
              </div>

            </div>
          </div>

          <div
            className={`pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 ${
              showScrollHint
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2"
            }`}
          >
            <div className="flex flex-col items-center gap-2 animate-bounce">
              <div className="rounded-full border border-white/20 bg-white/5 p-3 shadow-[0_0_25px_rgba(96,165,250,0.18)] backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white/80"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.7}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
          
        </section>

        <section className="mx-auto max-w-7xl px-8 pb-24 pt-12">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-4xl font-bold text-white md:text-5xl">
              ¿Por qué Knowlace?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-white/70">
              Herramientas diseñadas para transformar tu forma de enseñar
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={ClockIcon}
              title="Feedback inmediato"
              description="Obtén respuestas en tiempo real sin cambiar tu forma de enseñar. Conecta con tu audiencia al instante."
              className="lg:col-span-2 lg:row-span-1"
            />

            <FeatureCard
              icon={EyeIcon}
              title="Atención sostenida"
              description="Mantén el foco del alumnado durante toda la sesión."
            />

            <FeatureCard
              icon={BoltIcon}
              title="Integración inmediata"
              description="Añade interacción a tus presentaciones en segundos."
            />

            <FeatureCard
              icon={SparklesIcon}
              title="Generación de Preguntas"
              description="Transforma cualquier contenido en preguntas interactivas en segundos."
              className="lg:col-span-2"
            />
          </div>
        </section>

      </main>
    </div>
  )
}