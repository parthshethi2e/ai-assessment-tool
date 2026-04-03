/*
  Warnings:

  - You are about to drop the column `geography` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `industry` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `Organization` table. All the data in the column will be lost.
  - You are about to drop the column `qualitative` on the `Survey` table. All the data in the column will be lost.
  - Added the required column `aiInsights` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `answers` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `finalScore` to the `Survey` table without a default value. This is not possible if the table is not empty.
  - Made the column `maturityLevel` on table `Survey` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "geography",
DROP COLUMN "industry",
DROP COLUMN "size";

-- AlterTable
ALTER TABLE "Survey" DROP COLUMN "qualitative",
ADD COLUMN     "aiInsights" JSONB NOT NULL,
ADD COLUMN     "answers" JSONB NOT NULL,
ADD COLUMN     "finalScore" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "dataScore" DROP NOT NULL,
ALTER COLUMN "techScore" DROP NOT NULL,
ALTER COLUMN "aiUsageScore" DROP NOT NULL,
ALTER COLUMN "workforceScore" DROP NOT NULL,
ALTER COLUMN "leadershipScore" DROP NOT NULL,
ALTER COLUMN "governanceScore" DROP NOT NULL,
ALTER COLUMN "maturityLevel" SET NOT NULL;
