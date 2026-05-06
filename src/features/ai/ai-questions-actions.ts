"use server"

import { createHash } from "crypto"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { extractPdfPageText } from "@/lib/pdf/extractPdfText"
import { generateQuestionsFromText } from "@/features/ai/ai-questions-service"
import { generateQuestionsPreviewInputSchema } from "@/features/ai/ai-question.schema"

const MAX_PAGE_RANGE = 10
const MIN_TEXT_LENGTH = 80

function createTextHash(text: string) {
  return createHash("sha256").update(text).digest("hex")
}

function buildPageRange(fromPage: number, toPage: number) {
  return Array.from(
    { length: toPage - fromPage + 1 },
    (_, index) => fromPage + index
  )
}

export async function generateQuestionsPreviewAction(input: unknown) {
  const parsedInput = generateQuestionsPreviewInputSchema.parse(input)

  const authSession = await auth.api.getSession({
    headers: await headers(),
  })

  if (!authSession?.user?.id) {
    throw new Error("Unauthorized")
  }

  const teachingSession = await prisma.teachingSession.findUnique({
    where: {
      id: parsedInput.sessionId,
    },
    select: {
      id: true,
      ownerId: true,
      pdfUrl: true,
      pdfKey: true,
      pdfPages: true,
    },
  })

  if (!teachingSession) {
    throw new Error("Session not found")
  }

  if (teachingSession.ownerId !== authSession.user.id) {
    throw new Error("Forbidden")
  }

  if (parsedInput.toPage > teachingSession.pdfPages) {
    throw new Error("Selected page range exceeds the PDF page count")
  }

  const pageRange = buildPageRange(parsedInput.fromPage, parsedInput.toPage)

  if (pageRange.length > MAX_PAGE_RANGE) {
    throw new Error(`You can generate questions from a maximum of ${MAX_PAGE_RANGE} pages at once`)
  }

  const pageTexts: {
    page: number
    text: string
  }[] = []

  for (const page of pageRange) {
    const cachedPageText = await prisma.pdfPageText.findUnique({
      where: {
        sessionId_page: {
          sessionId: teachingSession.id,
          page,
        },
      },
    })

  if (
    cachedPageText &&
    cachedPageText.sourcePdfKey === teachingSession.pdfKey &&
    cachedPageText.text.trim().length > 0
  ) {
    
    pageTexts.push({
        page,
        text: cachedPageText.text,
      })

      continue
    }

    const extractedText = await extractPdfPageText(
      teachingSession.pdfUrl,
      page
    )

    const normalizedText = extractedText.trim()

    if (!normalizedText) {
      continue
    }

    await prisma.pdfPageText.upsert({
      where: {
        sessionId_page: {
          sessionId: teachingSession.id,
          page,
        },
      },
      create: {
        sessionId: teachingSession.id,
        page,
        text: normalizedText,
        textHash: createTextHash(normalizedText),
        sourcePdfKey: teachingSession.pdfKey,
      },
      update: {
        text: normalizedText,
        textHash: createTextHash(normalizedText),
        sourcePdfKey: teachingSession.pdfKey,
      },
    })

    pageTexts.push({
      page,
      text: normalizedText,
    })
  }

  const sourceText = pageTexts
    .map((pageText) => `[Page ${pageText.page}]\n${pageText.text}`)
    .join("\n\n")

  if (sourceText.trim().length < MIN_TEXT_LENGTH) {
    throw new Error(
      "Not enough readable text found in the selected PDF page range"
    )
  }

  const questions = await generateQuestionsFromText({
    text: sourceText,
    amount: parsedInput.amount,
    type: parsedInput.type,
  })

  return {
    sourcePages: pageRange,
    sourceText,
    questions,
  }
}