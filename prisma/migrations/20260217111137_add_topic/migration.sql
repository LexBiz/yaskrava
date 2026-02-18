-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Application" (
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
    "topic" TEXT NOT NULL DEFAULT 'LEASING',
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "adminNote" TEXT
);
INSERT INTO "new_Application" ("adminNote", "archived", "calculator", "city", "consent", "createdAt", "email", "fullName", "id", "locale", "message", "phone", "sourcePath", "status", "updatedAt") SELECT "adminNote", "archived", "calculator", "city", "consent", "createdAt", "email", "fullName", "id", "locale", "message", "phone", "sourcePath", "status", "updatedAt" FROM "Application";
DROP TABLE "Application";
ALTER TABLE "new_Application" RENAME TO "Application";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
