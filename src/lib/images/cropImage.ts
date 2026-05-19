export type PixelCrop = {
  x: number
  y: number
  width: number
  height: number
}

export async function getCroppedImageFile({
  imageSrc,
  crop,
  fileName = "avatar.webp",
}: {
  imageSrc: string
  crop: PixelCrop
  fileName?: string
}) {
  const image = await createImage(imageSrc)

  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")

  if (!ctx) {
    throw new Error("No se pudo procesar la imagen.")
  }

  const OUTPUT_SIZE = 256

  canvas.width = OUTPUT_SIZE
  canvas.height = OUTPUT_SIZE

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    OUTPUT_SIZE,
    OUTPUT_SIZE
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo generar la imagen recortada."))
          return
        }

        resolve(blob)
      },
      "image/webp",
      0.88
    )
  })

  return new File([blob], fileName, {
    type: "image/webp",
  })
}

function createImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.crossOrigin = "anonymous"

    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", () => {
      reject(new Error("No se pudo cargar la imagen."))
    })

    image.src = src
  })
}