"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { generateAccessCode } from "@/lib/utils/generateAccessCode"
import { uploadPdfToR2, getPublicR2Url, deleteObjectFromR2 } from "@/features/storage/r2-service"
import { getPdfPages } from "@/lib/pdf/getPdfPages"

export async function createSession({
  title,
  description,
  file,
}: {
  title: string
  description?: string
  file: File
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("Unauthorized")
  }

  if (!title.trim()) {
    throw new Error("Título requerido")
  }

  if (!file) {
    throw new Error("Debes subir un PDF")
  }

  if (file.type !== "application/pdf") {
    throw new Error("El archivo debe ser un PDF")
  }

  const pdfPages = await getPdfPages(file)

  if (!pdfPages || pdfPages <= 0) {
    throw new Error("PDF inválido")
  }

  const { key } = await uploadPdfToR2(file, "dev")

  try {
    
    const pdfUrl = getPublicR2Url(key)
    const accessCode = generateAccessCode()

    const newSession = await prisma.teachingSession.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        ownerId: session.user.id,
        accessCode,
        pdfUrl,
        pdfKey: key,
        pdfPages,
      },
    })

    return newSession
  } catch (error) {
    await deleteObjectFromR2(key)
    throw error
  }
}

export async function toggleSession(sessionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("Unauthorized")
  }

  const existing = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
  })

  if (!existing || existing.ownerId !== session.user.id) {
    throw new Error("Forbidden")
  }

  const updated = await prisma.teachingSession.update({
    where: { id: sessionId },
    data: { isActive: !existing.isActive },
  })

  return updated
}

export async function joinSession(accessCode: string, name: string) {
  if (!name || name.trim().length < 2) {
    throw new Error("Nombre inválido")
  }

  const session = await prisma.teachingSession.findUnique({
    where: { accessCode: accessCode.toUpperCase() },
  })

  if (!session) {
    throw new Error("Sesión no encontrada")
  }

  const trimmedName = name.trim()

  const existing = await prisma.participant.findFirst({
    where: {
      sessionId: session.id,
      name: trimmedName,
    },
  })

  if (existing) {
    if (!existing.isActive) {
      await prisma.participant.update({
        where: { id: existing.id },
        data: { isActive: true },
      })
    } else {
      throw new Error("Nombre ya en uso")
    }

    return {
      participantId: existing.id,
      sessionId: session.id,
    }
  }

  const participant = await prisma.participant.create({
    data: {
      name: trimmedName,
      sessionId: session.id,
      isActive: true
    },
  })

  return {
    participantId: participant.id,
    sessionId: session.id,
  }
}

export async function reconnectParticipant(participantId: string) {
  const participant = await prisma.participant.findUnique({
    where: { id: participantId },
  })

  if (!participant) return null

  await prisma.participant.update({
    where: { id: participantId },
    data: {
      isActive: true,
      lastSeen: new Date(),
    },
  })

  return participant
}

export async function leaveParticipant(participantId: string) {
  await prisma.participant.update({
    where: { id: participantId },
    data: { isActive: false },
  })

  return { success: true }
}

export async function deleteSession(sessionId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("Unauthorized")
  }

  const existing = await prisma.teachingSession.findUnique({
    where: { id: sessionId },
  })

  if (!existing || existing.ownerId !== session.user.id) {
    throw new Error("Forbidden")
  }

  await deleteObjectFromR2(existing.pdfKey)

  await prisma.teachingSession.delete({
    where: { id: sessionId },
  })

  return { success: true }
}