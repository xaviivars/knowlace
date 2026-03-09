-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('IDLE', 'COUNTDOWN', 'ACTIVE', 'RESULTS');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "status" "QuestionStatus" NOT NULL DEFAULT 'IDLE';
