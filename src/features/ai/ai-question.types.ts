import { QuestionType } from "@prisma/client"

export type GenerateQuestionsPreviewInput = {
  sessionId: string
  page: number
  amount: number
  type: QuestionType
}

export type GeneratedQuestionOption = {
  content: string
  isCorrect: boolean
}

export type GeneratedQuestion = {
  type: QuestionType
  content: string
  options: GeneratedQuestionOption[]
  explanation?: string
}

export type GenerateQuestionsPreviewResult = {
  sourcePage: number
  sourceText: string
  questions: GeneratedQuestion[]
}