"use client"

import { useState } from "react"
import { createSession } from "@/features/session/session-actions"
import { useRouter } from "next/navigation"
import { PdfUpload } from "@/components/ui/PdfUpload"
import { UploadBlockingOverlay } from "@/components/ui/UploadBlockingOverlay"

export default function NewSessionForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setPdfError("Debes subir un PDF.")
      return
    }

    setPdfError(null)
    setLoading(true)

    try {
      const session = await createSession({
        title,
        description,
        file,
      })

      router.push(`/dashboard/sessions/${session.id}`)

    } catch (error) {
      console.error(error)
      
      alert(
        error instanceof Error
        ? error.message
        : "No se pudo crear la sesión"
    )
      setLoading(false)
    }
  }
  return (
    <div className="relative min-h-screen bg-[#0e1d38] flex items-center justify-center px-4">

      <UploadBlockingOverlay
        show={loading}
        title="Creando sesión"
        description="Estamos subiendo el PDF y preparando tu sesión. Esto puede tardar unos segundos."
      />

      <button
        type="button"
        onClick={() => router.push("/dashboard")}
        disabled={loading}
        className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="text-lg">←</span>
        Volver
      </button>

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
              placeholder="Añade una breve descripción de tu sesión."
              rows={4}
              className="bg-[#0e1d38] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            />
          </div>

          <PdfUpload
            file={file}
            onFileChange={setFile}
            disabled={loading}
            error={pdfError}
            onError={setPdfError}
          />

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