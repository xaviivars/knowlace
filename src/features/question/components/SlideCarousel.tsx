"use client"

type SlideCarouselItem = {
  id: string
  order: number
  type: "PDF" | "QUESTION"
  page?: number
  question: {
    content: string
  } | null
}

export function SlideCarousel({
  slides,
  selectedIndex,
  onSelect,
}: {
  slides: SlideCarouselItem[]
  selectedIndex: number
  onSelect: (index: number) => void
}) {

  return (
    <div className="w-full overflow-x-auto pretty-scrollbar">
      <div className="flex gap-3 px-4 py-2 snap-x snap-mandatory">
        {slides.map((slide, index) => {
          const isSelected = index === selectedIndex

          return (
            <div
              key={index}
              onClick={() => onSelect(index)}
              className={`min-w-30 snap-start cursor-pointer rounded-xl border p-3 transition duration-300
              ${
                isSelected
                  ? "scale-[1.02] border-indigo-500 bg-indigo-500/20"
                  : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:scale-[1.01]"
              }`}
            >
              {slide.type === "PDF" ? (
                <div className="text-center">
                  <div className="text-2xl">📄</div>
                  <div className="text-sm mt-1">
                    Página {slide.page}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-sm font-semibold mb-1">❓ Pregunta</div>
                  <div className="text-xs text-zinc-400 line-clamp-3">
                    {slide.question?.content ?? "Pregunta sin contenido" }
                  </div>
                </div>
              )}
            </div>
          )
        })}

        { /* CARD DE INSERTAR AL FINAL */ }
        <div
          onClick={() => onSelect(slides.length)}
          className={`min-w-30 shrink-0 cursor-pointer rounded-xl border p-3 flex items-center justify-center
          ${
            selectedIndex === slides.length
              ? "border-green-500 bg-green-500/20"
              : "border-dashed border-zinc-600 hover:bg-zinc-700"
          }`}
        >
          ➕ Final
        </div>
      </div>
    </div>
  )
}