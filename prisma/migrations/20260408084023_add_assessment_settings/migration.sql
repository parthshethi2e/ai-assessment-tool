-- CreateTable
CREATE TABLE "AssessmentSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "reportGenerationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentSetting_key_key" ON "AssessmentSetting"("key");
