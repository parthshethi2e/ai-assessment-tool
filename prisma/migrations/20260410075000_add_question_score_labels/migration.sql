ALTER TABLE "AssessmentQuestion"
ADD COLUMN "scoreLabels" JSONB;

UPDATE "AssessmentQuestion"
SET "scoreLabels" = '{
  "1": "Not in place",
  "2": "Exploring",
  "3": "Emerging",
  "4": "Operational",
  "5": "Leading"
}'::jsonb
WHERE "scoreLabels" IS NULL;
