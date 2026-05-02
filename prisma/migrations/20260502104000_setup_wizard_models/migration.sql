-- CreateTable
CREATE TABLE "InjectionSchedule" (
    "id" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "defaultDosage" DECIMAL(10,2) NOT NULL,
    "defaultNeedlesPerInjection" INTEGER NOT NULL,
    "trackingWindowMinutes" INTEGER NOT NULL DEFAULT 30,
    "missedThresholdHours" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InjectionSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjectionScheduleTime" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "InjectionScheduleTime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InjectionEvent" (
    "id" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InjectionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InjectionScheduleTime_scheduleId_timeOfDay_key" ON "InjectionScheduleTime"("scheduleId", "timeOfDay");

-- CreateIndex
CREATE INDEX "InjectionEvent_scheduleId_scheduledAt_idx" ON "InjectionEvent"("scheduleId", "scheduledAt");

-- AddForeignKey
ALTER TABLE "InjectionSchedule" ADD CONSTRAINT "InjectionSchedule_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjectionScheduleTime" ADD CONSTRAINT "InjectionScheduleTime_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "InjectionSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjectionEvent" ADD CONSTRAINT "InjectionEvent_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InjectionEvent" ADD CONSTRAINT "InjectionEvent_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "InjectionSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;
