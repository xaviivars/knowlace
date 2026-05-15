import {
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2"

type StorageEnv = "dev" | "prod"

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
}

function getBasePrefix(env: StorageEnv) {
  return env
}

export function buildPdfKey({
  env,
  userId,
  sessionId,
  filename,
}: {
  env: StorageEnv
  userId: string
  sessionId: string
  filename: string
}) {
  const safeName = sanitizeFilename(filename)

  return `${getBasePrefix(env)}/pdfs/${userId}/${sessionId}/slides-${Date.now()}-${safeName}`
}

export function buildProfileImageKey({
  env,
  userId,
  extension,
}: {
  env: StorageEnv
  userId: string
  extension: string
}) {
  return `${getBasePrefix(env)}/profile_pics/${userId}/avatar-${Date.now()}.${extension}`
}

export async function uploadPdfToR2({
  file,
  env = "dev",
  userId,
  sessionId,
}: {
  file: File
  env?: StorageEnv
  userId: string
  sessionId: string
}) {
  const buffer = Buffer.from(await file.arrayBuffer())

  const key = buildPdfKey({
    env,
    userId,
    sessionId,
    filename: file.name,
  })

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type || "application/pdf",
    })
  )

  return { key }
}

export async function deleteObjectFromR2(key: string) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    })
  )
}

export function getPublicR2Url(key: string) {
  return `${R2_PUBLIC_URL}/${key}`
}