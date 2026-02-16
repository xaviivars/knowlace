import LightRays from '../components/LightRays';
import HeroCTA from '@/components/HeroCTA';

const Home = () => {
  return (

    <div className="relative min-h-screen overflow-hidden">
      
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

      <section className="relative z-10 flex items-start gap-80 px-12 py-4">

        <div className="max-w-xl my-4">
          <h1 className="text-white text-6xl font-bold">
            Mantén el foco.
          </h1>
          <p className="text-white text-2xl my-6">
            Dale un ritmo diferente a tu educación mediante las presentaciones interactivas de Knowlace.
          </p>
        </div>

      <section className="flex gap-16">
        <HeroCTA/>
      </section>

      </section>

    </div>
  )
}

export default Home