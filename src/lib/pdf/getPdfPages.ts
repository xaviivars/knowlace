import * as pdfjsLib from "pdfjs-dist"

export async function getPdfPages(file: File): Promise<number> {
    const buffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
    return pdf.numPages
  }

export async function getPdfPagesFromUrl(url: string): Promise<number> {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()

  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  return pdf.numPages
}