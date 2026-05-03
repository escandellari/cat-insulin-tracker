-- CreateTable
CREATE TABLE "InjectionLog" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "dosageGiven" DECIMAL(10,2) NOT NULL,
    "needlesUsed" INTEGER NOT NULL,
    "actualGivenAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InjectionLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InjectionLog_eventId_key" ON "InjectionLog"("eventId");

-- CreateIndex
CREATE INDEX "InjectionLog_eventId_idx" ON "InjectionLog"("eventId");

-- AddForeignKey
ALTER TABLE "InjectionLog" ADD CONSTRAINT "InjectionLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "InjectionEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
