"use client"

export default function WaitingRoomView() {

  return (
    <div className="flex-1 bg-[#0b162c] flex items-center justify-center">

      <div className="text-center">

        <h2 className="text-3xl font-semibold mb-4">
          Esperando al profesor...
        </h2>

        <p className="text-white/60">
          La sesión comenzará en breve.
        </p>

      </div>

    </div>
  )

}