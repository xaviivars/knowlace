export type QuestionOption = {
  id: string
  content: string
  isCorrect: boolean
}

export type FrontQuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"

export type QuestionWithOptions = {
  id: string
  type: FrontQuestionType
  content: string
  pageNumber: number
  options: QuestionOption[]
  status: "IDLE" | "COUNTDOWN" | "ACTIVE" | "RESULTS"
}

export type QuestionStats = {
  questionId: string
  totalAnswers: number
  correctAnswers: number
  percentage: number
  optionCounts: Record<string, number>
  totalParticipants: number
}