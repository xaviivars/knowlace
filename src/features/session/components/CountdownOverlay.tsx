"use client"

type Props = {
  seconds: number | null
}

export default function CountdownOverlay({ seconds }: Props) {
  if (seconds === null) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#06101f]/75 text-white backdrop-blur-md">
      <div className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex flex-col items-center">
        <div className="absolute h-56 w-56 animate-ping rounded-full border border-blue-300/20" />

        <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="absolute inset-3 rounded-full border border-blue-300/20 shadow-[0_0_70px_rgba(59,130,246,0.22)]" />

          <div className="absolute inset-0 flex items-center justify-center">
            <span
              key={seconds}
              className="
                block
                animate-[countdownPop_0.55s_ease-out]
                font-sans
                text-8xl
                font-black
                leading-none
                text-center
                text-white
                [font-variant-numeric:tabular-nums]
                drop-shadow-[0_0_24px_rgba(147,197,253,0.25)]
              "
            >
              {seconds}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}