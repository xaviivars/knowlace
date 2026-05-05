-- CreateTable
CREATE TABLE "PdfPageText" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "page" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "textHash" TEXT,
    "sourcePdfKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdfPageText_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PdfPageText_sessionId_idx" ON "PdfPageText"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "PdfPageText_sessionId_page_key" ON "PdfPageText"("sessionId", "page");

-- AddForeignKey
ALTER TABLE "PdfPageText" ADD CONSTRAINT "PdfPageText_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TeachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
