-- Create enums
CREATE TYPE "CommunityStatus" AS ENUM ('active', 'inactive');
CREATE TYPE "EventStatus" AS ENUM ('draft', 'published', 'registration_closed', 'cancelled', 'completed');
CREATE TYPE "EventType" AS ENUM ('tournament', 'practice', 'festival', 'volunteer', 'workshop');
CREATE TYPE "RegistrationStatus" AS ENUM ('confirmed', 'waitlisted', 'cancelled', 'checked_in');

-- Create tables
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "CommunityStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "fullDescription" TEXT NOT NULL,
    "eventType" "EventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'draft',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "registrationDeadline" TIMESTAMP(3) NOT NULL,
    "venueName" TEXT NOT NULL,
    "fullAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EventSlot" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "slotDate" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "peopleNeeded" INTEGER NOT NULL,
    "meetingPoint" TEXT,
    "instructions" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventSlot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "notes" TEXT,
    "consentWaiverAccepted" BOOLEAN NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'confirmed',
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "manageTokenHash" TEXT NOT NULL,
    "createdIp" TEXT,
    "updatedIp" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");
CREATE UNIQUE INDEX "Registration_manageTokenHash_key" ON "Registration"("manageTokenHash");
CREATE INDEX "Event_communityId_status_startDate_idx" ON "Event"("communityId", "status", "startDate");
CREATE INDEX "EventSlot_eventId_slotDate_idx" ON "EventSlot"("eventId", "slotDate");
CREATE INDEX "Registration_eventId_slotId_status_idx" ON "Registration"("eventId", "slotId", "status");
CREATE INDEX "Registration_email_idx" ON "Registration"("email");
CREATE UNIQUE INDEX "Registration_slotId_email_status_key" ON "Registration"("slotId", "email", "status");

-- Add foreign keys
ALTER TABLE "Event" ADD CONSTRAINT "Event_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventSlot" ADD CONSTRAINT "EventSlot_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "EventSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
