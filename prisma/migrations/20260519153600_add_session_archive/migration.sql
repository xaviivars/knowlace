/*
  Warnings:

  - You are about to drop the column `archivedAt` on the `PdfPageText` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `PdfPageText` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PdfPageText" DROP COLUMN "archivedAt",
DROP COLUMN "isArchived";

-- AlterTable
ALTER TABLE "TeachingSession" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;
