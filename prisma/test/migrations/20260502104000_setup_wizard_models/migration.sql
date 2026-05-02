-- CreateTable
CREATE TABLE "InjectionSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "catId" TEXT NOT NULL,
    "defaultDosage" DECIMAL NOT NULL,
    "defaultNeedlesPerInjection" INTEGER NOT NULL,
    "trackingWindowMinutes" INTEGER NOT NULL DEFAULT 30,
    "missedThresholdHours" INTEGER NOT NULL DEFAULT 12,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InjectionSchedule_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InjectionScheduleTime" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scheduleId" TEXT NOT NULL,
    "timeOfDay" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    CONSTRAINT "InjectionScheduleTime_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "InjectionSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InjectionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "catId" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "scheduledAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InjectionEvent_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InjectionEvent_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "InjectionSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "InjectionScheduleTime_scheduleId_timeOfDay_key" ON "InjectionScheduleTime"("scheduleId", "timeOfDay");

-- CreateIndex
CREATE INDEX "InjectionEvent_scheduleId_scheduledAt_idx" ON "InjectionEvent"("scheduleId", "scheduledAt");
