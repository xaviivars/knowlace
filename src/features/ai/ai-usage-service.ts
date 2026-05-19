import { prisma } from "@/lib/prisma"

type AiUsagePeriod =
  | { type: "daily" }
  | { type: "monthly" }
  | { type: "fixed_hours"; hours: number }

export const AI_USAGE_LIMIT = {
  period: { type: "daily" } as const,
  maxTokens: 1580,
}

export function estimateTokensFromText(text: string) {
  return Math.ceil(text.length / 4)
}

export async function getAiUsageSummary(userId: string) {
  const period = getAiUsagePeriod()

  const usage = await prisma.aiUsage.findUnique({
    where: {
      userId_periodType_periodStart: {
        userId,
        periodType: period.periodType,
        periodStart: period.periodStart,
      },
    },
  })

  const usedTokens = usage?.totalTokens ?? 0
  const remainingTokens = Math.max(AI_USAGE_LIMIT.maxTokens - usedTokens, 0)

  return {
    periodType: period.periodType,
    periodStart: period.periodStart,
    periodEnd: period.periodEnd,
    usedTokens,
    remainingTokens,
    maxTokens: AI_USAGE_LIMIT.maxTokens,
    requests: usage?.requests ?? 0,
  }
}

export function getAiUsagePeriod(
  period: AiUsagePeriod = AI_USAGE_LIMIT.period
) {
  const now = new Date()

  if (period.type === "daily") {
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)

    const end = new Date(start)
    end.setDate(end.getDate() + 1)

    return {
      periodType: "daily",
      periodStart: start,
      periodEnd: end,
    }
  }

  if (period.type === "monthly") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    return {
      periodType: "monthly",
      periodStart: start,
      periodEnd: end,
    }
  }

  const start = new Date(now)
  start.setMinutes(0, 0, 0)

  const currentHour = start.getHours()
  const periodStartHour = Math.floor(currentHour / period.hours) * period.hours

  start.setHours(periodStartHour, 0, 0, 0)

  const end = new Date(start)
  end.setHours(end.getHours() + period.hours)

  return {
    periodType: `fixed_${period.hours}_hours`,
    periodStart: start,
    periodEnd: end,
  }
}

export async function assertCanUseAi({
  userId,
  estimatedTokens,
}: {
  userId: string
  estimatedTokens: number
}) {
  const period = getAiUsagePeriod()

  const usage = await prisma.aiUsage.findUnique({
    where: {
      userId_periodType_periodStart: {
        userId,
        periodType: period.periodType,
        periodStart: period.periodStart,
      },
    },
  })

  const currentTokens = usage?.totalTokens ?? 0
  const remainingTokens = AI_USAGE_LIMIT.maxTokens - currentTokens

  if (estimatedTokens > remainingTokens) {
    throw new Error(
      "Has alcanzado el límite diario de uso de IA. Podrás volver a generar preguntas más adelante."
    )
  }

  return {
    period,
    currentTokens,
    remainingTokens,
  }
}

export async function trackAiUsage({
  userId,
  inputTokens,
  outputTokens,
}: {
  userId: string
  inputTokens: number
  outputTokens: number
}) {
  const period = getAiUsagePeriod()
  const totalTokens = inputTokens + outputTokens

  await prisma.aiUsage.upsert({
    where: {
      userId_periodType_periodStart: {
        userId,
        periodType: period.periodType,
        periodStart: period.periodStart,
      },
    },
    create: {
      userId,
      periodType: period.periodType,
      periodStart: period.periodStart,
      periodEnd: period.periodEnd,
      inputTokens,
      outputTokens,
      totalTokens,
      requests: 1,
    },
    update: {
      inputTokens: {
        increment: inputTokens,
      },
      outputTokens: {
        increment: outputTokens,
      },
      totalTokens: {
        increment: totalTokens,
      },
      requests: {
        increment: 1,
      },
    },
  })
}