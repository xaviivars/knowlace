"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { generateAccessCode } from "@/lib/utils/generateAcessCode"

export async function createSession(title: string, description?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("Unauthorized")
  }

  const accessCode = generateAccessCode()

  const newSession = await prisma.teachingSession.create({
    data: {
      title,
      description,
      ownerId: session.user.id,
      accessCode,
    },
  })

  return newSession
}