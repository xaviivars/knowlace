"use client"

import { useState } from "react"
import { createSession } from "@/lib/actions/session-actions"
import { useRouter } from "next/navigation"

export default function NewSessionForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const session = await createSession(title, description)
      router.push(`/dashboard/sessions/${session.id}`)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0e1d38] flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-[#142544] p-8 rounded-2xl shadow-2xl border border-white/10">
        
        <h2 className="text-3xl font-bold text-white mb-2">
          Crear nueva sesión
        </h2>

        <p className="text-white/60 mb-6">
          Configura tu sesión y comparte el código con tus alumnos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/70">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Repaso Tema 3"
              required
              className="bg-[#0e1d38] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm text-white/70">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Añade una breve descripción..."
              rows={4}
              className="bg-[#0e1d38] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition-all duration-200 text-white font-semibold py-3 rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando sesión..." : "Crear sesión"}
          </button>

        </form>
      </div>
    </div>
  )
}