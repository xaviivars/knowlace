/*
  Warnings:

  - Added the required column `pdfKey` to the `TeachingSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeachingSession" ADD COLUMN     "pdfKey" TEXT NOT NULL;
