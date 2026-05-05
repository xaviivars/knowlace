import pdfParse from "pdf-parse/lib/pdf-parse"

type PdfTextItem = {
  str?: string
}

type PdfPageData = {
  getTextContent: () => Promise<{
    items: PdfTextItem[]
  }>
}

export function normalizePdfText(text: string) {
  return text
    .replace(/\s+/g, " ")
    .replace(/\u0000/g, "")
    .trim()
}

export async function extractPdfPageText(pdfUrl: string, page: number) {
  if (!pdfUrl) {
    throw new Error("PDF URL is required")
  }

  if (!Number.isInteger(page) || page < 1) {
    throw new Error("Invalid PDF page")
  }

  const response = await fetch(pdfUrl)

  if (!response.ok) {
    throw new Error("Could not download PDF")
  }

  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  let currentPage = 0
  let pageText = ""

  await pdfParse(buffer, {
    pagerender: async (pageData: PdfPageData) => {
      currentPage += 1

      if (currentPage !== page) {
        return ""
      }

      const textContent = await pageData.getTextContent()

      pageText = textContent.items
        .map((item) => item.str ?? "")
        .join(" ")

      return pageText
    },
  })

  const normalizedText = normalizePdfText(pageText)

  if (!normalizedText) {
    throw new Error("No readable text found on this PDF page")
  }

  return normalizedText
}