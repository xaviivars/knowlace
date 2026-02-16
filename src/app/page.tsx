import LightRays from '../components/LightRays';
import HeroCTA from '@/components/landing/HeroCTA';
import FeatureCard from "@/components/landing/FeatureCard";
import { BoltIcon, BoltSlashIcon, ClockIcon, EyeIcon } from "@heroicons/react/24/outline";

const Home = () => {
  return (

    <div className="relative min-h-screen overflow-hidden">
      
      <header className="w-full h-12 bg-[#c3ceec]">
        <div className="mx-auto text-center flex items-center justify-center h-full">
          Introduce un código para unirte a una sesión existente
          <input className="bg-white rounded-xl w-28 h-8 ml-4">
          </input>

          <button className="bg-blue-500 ml-2 w-16 h-8 font-semibold flex items-center justify-center text-white text-sm px-4 py-1 rounded-md hover:bg-blue-600 transition">
            Unirse
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

export default Home