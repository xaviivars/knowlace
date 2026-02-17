"use client"

import { useState } from "react"
import LightRays from '@/components/LightRays';
import { HeroCTA } from '@/components/landing/HeroCTA';
import FeatureCard from "@/components/landing/FeatureCard";
import { BoltIcon, ClockIcon, EyeIcon, XMarkIcon } from "@heroicons/react/24/outline";



export default function Home () {

  const [showJoinBar, setShowJoinBar] = useState(true)

  return (

    <div className="relative min-h-screen overflow-hidden">
        <header 
          className={`
            w-full
            bg-[#c3ceec]
            relative
            transition-all duration-300 ease-in-out
            ${showJoinBar ? "h-12 opacity-100" : "h-0 opacity-0"}
            `}
          >
          <div className="px-6 flex items-center justify-center h-full">
            <div className="flex items-center">
              <span>
                Introduce un código para unirte a una sesión existente
              </span>

              <input className="bg-white rounded-xl w-28 h-8 ml-4"/>

              <button className="bg-blue-500 ml-2 w-16 h-8 font-semibold flex items-center justify-center text-white text-sm px-4 py-1 rounded-md hover:bg-blue-600 transition">
                Unirse
              </button>

            </div>

            <button 
              onClick={() => setShowJoinBar(false)}
              className="absolute right-6 text-gray-600 hover:text-gray-900 transition text-xl font-semibold"
              >
              <XMarkIcon className="w-5 h-5" />
            </button>

          </div>
        </header>

      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={0.5}
        rayLength={3}
        followMouse
        mouseInfluence={0.1}
        noiseAmount={0}
        distortion={0}
        pulsating={false}
        fadeDistance={1}
        saturation={1}
        className="absolute inset-0 w-full h-full -z-10"
      />
      
      <section className="relative z-10 flex gap-15 px-12 py-12">

        {/* Columna izquierda */}
        <div className="flex flex-col gap-4 max-w-32xl">
        
          <div>
            <h1 className="text-white text-6xl font-bold">
              Enseña como siempre. Llega como nunca.
            </h1>
            <p className="text-white text-2xl max-w-3xl my-4">
              Dale un ritmo diferente a la docencia mediante las presentaciones interactivas de Knowlace.
            </p>
          </div>
          
          <div className="flex flex-row gap-6">
            <FeatureCard
              className="h-55 w-70"
              icon={ClockIcon}
              title="Feedback inmediato"
              description="Obtén respuestas en tiempo real sin cambiar tu forma de enseñar."
            />

            <FeatureCard
              className="h-55 w-70"
              icon={EyeIcon}
              title="Atención sostenida"
              description="Mantén el foco del alumnado durante toda la sesión."
            />

            <FeatureCard
              className="h-55 w-70"
              icon={BoltIcon}
              title="Integración inmediata"
              description="Añade interacción a tus presentaciones en segundos."
            />

          </div>
        </div>

      <section className="flex gap-16">
        <HeroCTA/>
      </section>

      </section>

    </div>
  )
}