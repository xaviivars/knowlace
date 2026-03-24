/*
  Warnings:

  - Added the required column `pdfPages` to the `TeachingSession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TeachingSession" ADD COLUMN     "pdfPages" INTEGER NOT NULL;
