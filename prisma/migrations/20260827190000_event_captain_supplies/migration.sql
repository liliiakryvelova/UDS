ALTER TABLE "Event"
ADD COLUMN "captainName" TEXT,
ADD COLUMN "supplies" TEXT[] DEFAULT ARRAY[]::TEXT[];

UPDATE "Event" SET "supplies" = ARRAY[]::TEXT[] WHERE "supplies" IS NULL;

ALTER TABLE "Event"
ALTER COLUMN "supplies" SET NOT NULL;
