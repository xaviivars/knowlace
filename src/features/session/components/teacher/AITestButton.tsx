"use client"

import { generateQuestionsPreviewAction } from "@/features/ai/ai-questions-actions"

type AiTestButtonProps = {
  sessionId: string
  page: number
}

export default function AiTestButton({ sessionId, page }: AiTestButtonProps) {
  async function handleClick() {
    try {
      const result = await generateQuestionsPreviewAction({
        sessionId,
        page,
        amount: 3,
        type: "MULTIPLE_CHOICE",
      })

      console.log("AI preview result:", result)
    } catch (error) {
      console.error("Error generating AI preview:", error)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      Test AI generation
    </button>
  )
}