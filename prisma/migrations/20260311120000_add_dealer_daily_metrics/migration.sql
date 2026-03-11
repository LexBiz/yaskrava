CREATE TABLE "DealerDailyMetric" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "vehicleCount" INTEGER NOT NULL DEFAULT 0,
    "applicationsTotal" INTEGER NOT NULL DEFAULT 0,
    "applicationsApproved" INTEGER NOT NULL DEFAULT 0,
    "applicationsRejected" INTEGER NOT NULL DEFAULT 0,
    "dealerId" TEXT NOT NULL,

    CONSTRAINT "DealerDailyMetric_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DealerDailyMetric_date_idx" ON "DealerDailyMetric"("date");

CREATE UNIQUE INDEX "DealerDailyMetric_dealerId_date_key" ON "DealerDailyMetric"("dealerId", "date");

ALTER TABLE "DealerDailyMetric"
ADD CONSTRAINT "DealerDailyMetric_dealerId_fkey"
FOREIGN KEY ("dealerId") REFERENCES "Dealer"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
