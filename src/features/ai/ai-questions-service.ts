import { GeneratedQuestion } from "./ai-question.types"

type GenerateQuestionsFromTextParams = {
  text: string
  amount: number
  type: "MULTIPLE_CHOICE"
}

export async function generateQuestionsFromText({
  text,
  amount,
  type,
}: GenerateQuestionsFromTextParams): Promise<GeneratedQuestion[]> {
  if (!text.trim()) {
    throw new Error("Cannot generate questions from empty text")
  }

  // Temporary mock until OpenAI integration.
  return Array.from({ length: amount }).map((_, index) => ({
    type,
    content: `Generated question ${index + 1} based on the selected PDF page`,
    options: [
      {
        content: "Correct option",
        isCorrect: true,
      },
      {
        content: "Incorrect option A",
        isCorrect: false,
      },
      {
        content: "Incorrect option B",
        isCorrect: false,
      },
      {
        content: "Incorrect option C",
        isCorrect: false,
      },
    ],
    explanation: "Temporary generated question used to test the AI preview flow.",
  }))
}