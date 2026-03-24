/*
  Warnings:

  - You are about to drop the column `pageNumber` on the `Question` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "SlideType" AS ENUM ('PDF', 'QUESTION');

-- DropIndex
DROP INDEX "Question_sessionId_pageNumber_idx";

-- DropIndex
DROP INDEX "Question_sessionId_pageNumber_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "pageNumber";

-- CreateTable
CREATE TABLE "Slide" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "SlideType" NOT NULL,
    "page" INTEGER,
    "questionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Slide_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Slide_questionId_key" ON "Slide"("questionId");

-- CreateIndex
CREATE INDEX "Slide_sessionId_order_idx" ON "Slide"("sessionId", "order");

-- CreateIndex
CREATE INDEX "Question_sessionId_idx" ON "Question"("sessionId");

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TeachingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slide" ADD CONSTRAINT "Slide_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
