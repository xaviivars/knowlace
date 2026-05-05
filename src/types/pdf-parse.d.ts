declare module "pdf-parse/lib/pdf-parse" {
  type PdfParseOptions = {
    pagerender?: (pageData: {
      getTextContent: () => Promise<{
        items: { str?: string }[]
      }>
    }) => Promise<string> | string
  }

  type PdfParseResult = {
    numpages: number
    numrender: number
    info: unknown
    metadata: unknown
    text: string
    version: string
  }

  function pdfParse(
    dataBuffer: Buffer,
    options?: PdfParseOptions
  ): Promise<PdfParseResult>

  export default pdfParse
}