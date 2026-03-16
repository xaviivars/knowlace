"use client"

import { QuestionView } from "@/features/session/components/teacher/QuestionView"
import { QuestionWithOptions } from "@/features/question/question.types"

type Props = {
  question: QuestionWithOptions
  participantId: string | null
  remainingTime: number | null
}

export default function StudentQuestionView({
  question,
  participantId,
  remainingTime
}: Props) {

  return (
    <QuestionView
      question={question}
      participantId={participantId ?? undefined}
      remainingTime={remainingTime ?? undefined}
      isActive={true}
    />
  )

}