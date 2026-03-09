export type QuestionOption = {
  id: string
  content: string
  isCorrect: boolean
}

export type QuestionWithOptions = {
  id: string
  content: string
  pageNumber: number
  options: QuestionOption[]
  status: "IDLE" | "COUNTDOWN" | "ACTIVE" | "RESULTS"
}

export type QuestionStats = {
  totalAnswers: number
  correctAnswers: number
  percentage: number
  optionCounts: Record<string, number>
}