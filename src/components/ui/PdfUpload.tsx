"use client"

type PdfUploadProps = {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export function PdfUpload({
  file,
  onFileChange,
  disabled = false,
}: PdfUploadProps) {
  return (
    <div className="space-y-2">

      <label
        className={[
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-[#0e1d38] px-4 py-6 text-center transition",
          "hover:border-blue-400/70 hover:bg-blue-500/10",
          disabled ? "cursor-not-allowed opacity-50" : "",
        ].join(" ")}
      >
        <input
          type="file"
          accept="application/pdf"
          disabled={disabled}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
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

      {file && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onFileChange(null)}
          className="text-xs text-red-300 hover:text-red-200 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
        >
          Quitar archivo
        </button>
      )}
    </div>
  )
}