-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "startedAt" TIMESTAMP(3);
