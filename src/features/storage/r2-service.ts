import {
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3"
import { r2, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2"

type StorageEnv = "dev" | "prod"
type AssetKind = "pdfs" | "avatars"

function sanitizeFilename(filename: string) {
  return filename
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
}

export function buildR2Key({
  env,
  kind,
  filename,
}: {
  env: StorageEnv
  kind: AssetKind
  filename: string
}) {
  const safeName = sanitizeFilename(filename)
  return `${env}/${kind}/${Date.now()}-${safeName}`
}

export async function uploadPdfToR2(
  file: File,
  env: StorageEnv = "dev"
) {
  const buffer = Buffer.from(await file.arrayBuffer())

  const key = buildR2Key({
    env,
    kind: "pdfs",
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