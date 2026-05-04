-- CreateTable
CREATE TABLE "SupplyRecord" (
    "id" TEXT NOT NULL,
    "catId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "startingAmount" DECIMAL(10,2) NOT NULL,
    "remainingAmount" DECIMAL(10,2) NOT NULL,
    "unit" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SupplyRecord_catId_type_isActive_idx" ON "SupplyRecord"("catId", "type", "isActive");

-- AddForeignKey
ALTER TABLE "SupplyRecord" ADD CONSTRAINT "SupplyRecord_catId_fkey" FOREIGN KEY ("catId") REFERENCES "Cat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
