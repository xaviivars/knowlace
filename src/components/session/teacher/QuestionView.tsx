type QuestionOption = {
  id: string
  content: string
  isCorrect: boolean
}

type QuestionWithOptions = {
  id: string
  content: string
  pageNumber: number
  options: QuestionOption[]
}

type QuestionViewProps = {
  question: QuestionWithOptions
  isOwner?: boolean
  onNext?: () => void
}

export function QuestionView({
  question,
  isOwner = false,
  onNext,
}: QuestionViewProps) {
  return (
    <div className="min-h-screen bg-[#0b162c] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-4xl space-y-10">

        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold leading-tight">
            {question.content}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {question.options.map((option) => (
            <div
              key={option.id}
              className="bg-white/10 hover:bg-white/20 transition p-6 rounded-2xl text-lg font-medium backdrop-blur-sm"
            >
              {option.content}
            </div>
          ))}
        </div>

        {isOwner && onNext && (
          <div className="flex justify-center pt-6">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl font-semibold"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}