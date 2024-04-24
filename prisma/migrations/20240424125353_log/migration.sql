/*
  Warnings:

  - Added the required column `authentication` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body` to the `Log` table without a default value. This is not possible if the table is not empty.
  - Added the required column `params` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authentication" TEXT NOT NULL,
    "dateTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Log" ("dateTime", "endpoint", "id", "method") SELECT "dateTime", "endpoint", "id", "method" FROM "Log";
DROP TABLE "Log";
ALTER TABLE "new_Log" RENAME TO "Log";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
