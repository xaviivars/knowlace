import { QuestionWithOptions } from "@/features/question/question.types"

export type Slide =
  | { type: "PDF"; page: number }
  | { type: "QUESTION"; question: QuestionWithOptions }