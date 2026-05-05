import OpenAI from "openai"
import { GeneratedQuestion } from "./ai-question.types"
import { generatedQuestionsSchema } from "./ai-question.schema"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"

  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  if (!text.trim()) {
    throw new Error("Cannot generate questions from empty text")
  }

  const response = await openai.responses.parse({
    model,
    store: false,
    input: [
      {
        role: "system",
        content: `
You are an expert assistant for generating educational quiz questions from teaching material.

Generate questions strictly based on the provided PDF page text.
Do not invent information that is not present in the text.
The questions must be clear, useful for a teacher, and suitable for a classroom quiz.

Rules:
- Generate exactly ${amount} questions.
- Only generate MULTIPLE_CHOICE questions.
- Each question must have exactly 4 options.
- Exactly one option must be correct.
- The incorrect options must be plausible but clearly wrong.
- Keep the language of the questions consistent with the source text.
- Include a brief explanation for the correct answer.
        `.trim(),
      },
      {
        role: "user",
        content: `
Question type: ${type}
Number of questions: ${amount}

PDF page text:
${text}
        `.trim(),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "generated_questions",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            questions: {
              type: "array",
              minItems: amount,
              maxItems: amount,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  type: {
                    type: "string",
                    enum: ["MULTIPLE_CHOICE"],
                  },
                  content: {
                    type: "string",
                  },
                  options: {
                    type: "array",
                    minItems: 4,
                    maxItems: 4,
                    items: {
                      type: "object",
                      additionalProperties: false,
                      properties: {
                        content: {
                          type: "string",
                        },
                        isCorrect: {
                          type: "boolean",
                        },
                      },
                      required: ["content", "isCorrect"],
                    },
                  },
                  explanation: {
                    type: "string",
                  },
                },
                required: ["type", "content", "options", "explanation"],
              },
            },
          },
          required: ["questions"],
        },
      },
    },
  })

  const parsed = generatedQuestionsSchema.parse(response.output_parsed)

  const invalidQuestion = parsed.questions.find((question) => {
    const correctOptions = question.options.filter((option) => option.isCorrect)
    return correctOptions.length !== 1
  })

  if (invalidQuestion) {
    throw new Error("Generated question must have exactly one correct option")
  }

  return parsed.questions
}