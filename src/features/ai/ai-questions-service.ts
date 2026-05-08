import OpenAI from "openai"
import { GeneratedQuestion } from "./ai-question.types"
import { generatedQuestionsSchema } from "./ai-question.schema"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

type SupportedAiQuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"

type GenerateQuestionsFromTextParams = {
  text: string
  amount: number
  type: SupportedAiQuestionType
}

function buildJsonSchema(type: SupportedAiQuestionType, amount: number) {
  if (type === "MULTIPLE_CHOICE") {
    return {
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
    }
  }

  if (type === "TRUE_FALSE") {
    return {
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
                enum: ["TRUE_FALSE"],
              },
              content: {
                type: "string",
              },
              options: {
                type: "array",
                minItems: 2,
                maxItems: 2,
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    content: {
                      type: "string",
                      enum: ["Verdadero", "Falso"],
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
    }
  }

  return {
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
              enum: ["SHORT_ANSWER"],
            },
            content: {
              type: "string",
            },
            options: {
              type: "array",
              minItems: 0,
              maxItems: 0,
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
  }
}

function validateGeneratedQuestions(questions: GeneratedQuestion[]) {
  for (const question of questions) {
    const correctOptions = question.options.filter((option) => option.isCorrect)

    if (question.type === "MULTIPLE_CHOICE") {
      if (question.options.length !== 4) {
        throw new Error("Multiple choice questions must have exactly 4 options")
      }

      if (correctOptions.length !== 1) {
        throw new Error("Multiple choice questions must have exactly one correct option")
      }
    }

    if (question.type === "TRUE_FALSE") {
      if (question.options.length !== 2) {
        throw new Error("True/false questions must have exactly 2 options")
      }

      if (correctOptions.length !== 1) {
        throw new Error("True/false questions must have exactly one correct option")
      }

      const optionContents = question.options.map((option) =>
        option.content.toLowerCase()
      )

      const hasTrue = optionContents.some(
        (content) => content.includes("verdadero") || content.includes("true")
      )

      const hasFalse = optionContents.some(
        (content) => content.includes("falso") || content.includes("false")
      )

      if (!hasTrue || !hasFalse) {
        throw new Error("True/false questions must include Verdadero and Falso options")
      }
    }

    if (question.type === "SHORT_ANSWER") {
      if (question.options.length !== 0) {
        throw new Error("Short answer questions must not have options")
      }
    }
  }
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
Do not add concepts, examples, causes, consequences, or explanations that are not explicitly supported by the text.
The questions must be clear, useful for a teacher, and suitable for a classroom quiz.
Keep the language of the questions consistent with the source text.

General rules:
- Generate exactly ${amount} question(s).
- The requested question type is ${type}.
- Include a brief explanation based only on the source text.
- If the source text is short, generate simpler factual questions instead of expanding the content.
- Do not mention the source text, PDF, document, fragment, or material in the question wording. Avoid phrases like "according to the text", "based on the text", "from the PDF", or "a partir del texto". Ask the question directly.

Rules for MULTIPLE_CHOICE:
- Generate a clear question.
- Generate exactly 4 options.
- Exactly one option must be correct.
- The incorrect options must be plausible but clearly wrong.

Rules for TRUE_FALSE:
- Generate a clear statement that can be answered as true or false.
- Generate exactly 2 options: "Verdadero" and "Falso".
- Exactly one option must be correct.
- The statement must be directly supported or contradicted by the source text.

Rules for SHORT_ANSWER:
- Generate an open-ended question.
- Do not generate answer options.
- The question must be answerable using the source text.
- The expected output must include options as an empty array.
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
        schema: buildJsonSchema(type, amount),
      },
    },
  })

  const parsed = generatedQuestionsSchema.parse(response.output_parsed)

  validateGeneratedQuestions(parsed.questions)

  return parsed.questions
}