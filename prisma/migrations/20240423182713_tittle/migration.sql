/*
  Warnings:

  - You are about to drop the column `name` on the `Event` table. All the data in the column will be lost.
  - Added the required column `title` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "max_participants" INTEGER,
    "dateTime" DATETIME NOT NULL
);
INSERT INTO "new_Event" ("dateTime", "description", "id", "max_participants", "slug") SELECT "dateTime", "description", "id", "max_participants", "slug" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
