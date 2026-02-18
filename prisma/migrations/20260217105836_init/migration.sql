-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "locale" TEXT NOT NULL,
    "sourcePath" TEXT,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "city" TEXT,
    "message" TEXT,
    "consent" BOOLEAN NOT NULL,
    "calculator" JSONB,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "availability" TEXT NOT NULL DEFAULT 'IN_TRANSIT',
    "title" TEXT NOT NULL,
    "make" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "mileageKm" INTEGER,
    "fuel" TEXT,
    "transmission" TEXT,
    "priceCzk" INTEGER,
    "description" TEXT,
    "imageUrl" TEXT,
    "vinLast6" TEXT
);
