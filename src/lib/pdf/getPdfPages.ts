import { PDFDocument } from "pdf-lib"

export async function getPdfPages(file: File): Promise<number> {
  const buffer = await file.arrayBuffer()
  const pdfDoc = await PDFDocument.load(buffer)
  return pdfDoc.getPageCount()
}