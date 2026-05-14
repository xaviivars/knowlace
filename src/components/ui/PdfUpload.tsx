"use client"

const MAX_PDF_SIZE_MB = 20
const MAX_PDF_SIZE = MAX_PDF_SIZE_MB * 1024 * 1024

type PdfUploadProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
  error?: string | null
  onError?: (error: string | null) => void
}

export function PdfUpload({
  file,
  onFileChange,
  disabled = false,
  error,
  onError,
}: PdfUploadProps) {

  function handleFileChange(selectedFile: File | undefined) {
    onError?.(null)

    if (!selectedFile) {
      onFileChange(null)
      return
    }

    if (selectedFile.type !== "application/pdf") {
      onFileChange(null)
      onError?.("El archivo debe ser un PDF.")
      return
    }

    if (selectedFile.size > MAX_PDF_SIZE) {
      onFileChange(null)
      onError?.(`El PDF no puede superar los ${MAX_PDF_SIZE_MB} MB.`)
      return
    }

    onFileChange(selectedFile)
  }

  return (
    <div className="space-y-2">

      <label
        className={[
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#0e1d38] px-4 py-6 text-center transition",
          "hover:border-blue-400/70 hover:bg-blue-500/10",
          disabled ? "cursor-not-allowed opacity-50" : "",
          error ? "border-red-400/50 bg-red-500/10" : "",
        ].join(" ")}
      >
        <input
          type="file"
          accept="application/pdf"
          disabled={disabled}
          onChange={(e) => handleFileChange(e.target.files?.[0])}
          className="hidden"
        />

        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
          PDF
        </div>

        <p className="text-sm font-medium text-white">
          {file ? file.name : "Seleccionar archivo PDF"}
        </p>

        <p className="mt-1 text-xs text-white/50">
          {file
            ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
            : "Haz clic para subir el material de la sesión"}
        </p>
      </label>

      {error && (
        <p className="text-xs font-medium text-red-300">
          {error}
        </p>
      )}

      {file && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            onFileChange(null)
            onError?.(null)
          }}
          className="cursor-pointer text-xs text-red-300 hover:text-red-200 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Quitar archivo
        </button>
      )}
    </div>
  )
}