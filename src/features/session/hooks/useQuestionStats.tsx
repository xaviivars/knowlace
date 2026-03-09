"use client"

import { useEffect, useState } from "react"
import { QuestionStats } from "@/features/question/question.types"

export function useQuestionStats(questionId: string | null) {

  const [stats, setStats] = useState<QuestionStats | null>(null)

  async function fetchStats() {

    if (!questionId) return

    const res = await fetch(
      `/api/question-stats?questionId=${questionId}`,
      { cache: "no-store" }
    )

    const data = await res.json()

    setStats(data)

  }

  useEffect(() => {
    fetchStats()
  }, [questionId])

  return {
    stats,
    refetchStats: fetchStats
  }
}