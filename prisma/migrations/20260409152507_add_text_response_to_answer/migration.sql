-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "textResponse" TEXT,
ALTER COLUMN "optionId" DROP NOT NULL;
