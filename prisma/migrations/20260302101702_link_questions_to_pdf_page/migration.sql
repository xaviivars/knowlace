/*
  Warnings:

  - You are about to drop the column `order` on the `Question` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sessionId,pageNumber]` on the table `Question` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pageNumber` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Question_sessionId_order_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "order",
ADD COLUMN     "pageNumber" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Question_sessionId_pageNumber_idx" ON "Question"("sessionId", "pageNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Question_sessionId_pageNumber_key" ON "Question"("sessionId", "pageNumber");
