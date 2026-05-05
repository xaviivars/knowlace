import { z } from "zod"

export const generateQuestionsPreviewInputSchema = z.object({
  sessionId: z.string().min(1),
  page: z.number().int().min(1),
  amount: z.number().int().min(1).max(5),
  type: z.enum(["MULTIPLE_CHOICE"]),
})

export const generatedQuestionOptionSchema = z.object({
  content: z.string().min(1),
  isCorrect: z.boolean(),
})

export const generatedQuestionSchema = z.object({
  type: z.enum(["MULTIPLE_CHOICE"]),
  content: z.string().min(1),
  options: z.array(generatedQuestionOptionSchema).min(2).max(6),
  explanation: z.string().optional(),
})

export const generatedQuestionsSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1).max(5),
})