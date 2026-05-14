"use server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { r2 } from "@/lib/r2"

const MAX_AVATAR_SIZE = 2 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
]

function getExtension(file: File) {
  if (file.type === "image/jpeg") return "jpg"
  if (file.type === "image/png") return "png"
  if (file.type === "image/webp") return "webp"

  return "webp"
}

export async function updateProfileImageAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("No autorizado")
  }

  const file = formData.get("image")

  if (!(file instanceof File)) {
    throw new Error("No se ha recibido ninguna imagen")
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Formato no permitido. Usa JPG, PNG o WEBP.")
  }

  if (file.size > MAX_AVATAR_SIZE) {
    throw new Error("La imagen no puede superar los 2MB.")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      imageKey: true,
    },
  })

  if (!user) {
    throw new Error("Usuario no encontrado")
  }

  if (user.imageKey) {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: user.imageKey,
      })
    )
  }

  const extension = getExtension(file)

  const PROFILE_PICS_PREFIX =
    process.env.R2_PROFILE_PICS_PREFIX ?? "dev/profile_pics"

  const key = `${PROFILE_PICS_PREFIX}/${session.user.id}/avatar-${Date.now()}.${extension}`

  const buffer = Buffer.from(await file.arrayBuffer())

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  )

  const imageUrl = `${process.env.R2_PUBLIC_URL}/${key}`

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      image: imageUrl,
      imageKey: key,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")

  return {
    image: imageUrl,
  }
}

export async function deleteProfileImageAction() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("No autorizado")
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      imageKey: true,
    },
  })

  if (!user) {
    throw new Error("Usuario no encontrado")
  }

  if (user.imageKey) {
    await r2.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: user.imageKey,
      })
    )
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      image: null,
      imageKey: null,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")

  return {
    success: true,
  }
}

export async function updateProfileAction(formData: FormData) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    throw new Error("No autorizado")
  }

  const name = formData.get("name")

  if (typeof name !== "string") {
    throw new Error("Nombre no válido")
  }

  const trimmedName = name.trim()

  if (!trimmedName) {
    throw new Error("El nombre no puede estar vacío")
  }

  if (trimmedName.length > 80) {
    throw new Error("El nombre no puede superar los 80 caracteres")
  }

  await prisma.user.update({
    where: {
      id: session.user.id,
    },
    data: {
      name: trimmedName,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/dashboard/settings")
}