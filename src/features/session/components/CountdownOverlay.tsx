"use client"

type Props = {
  seconds: number | null
}

export default function CountdownOverlay({ seconds }: Props) {

  if (seconds === null) return null

  return (
    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="text-8xl font-bold text-white animate-pulse">
        {seconds}
      </div>
    </div>
  )

}