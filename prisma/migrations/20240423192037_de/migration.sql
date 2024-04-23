/*
  Warnings:

  - You are about to drop the column `description` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `max_participants` on the `Event` table. All the data in the column will be lost.
  - Added the required column `details` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "maximum_attendees" INTEGER,
    "dateTime" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("dateTime", "id", "slug", "title") SELECT "dateTime", "id", "slug", "title" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
