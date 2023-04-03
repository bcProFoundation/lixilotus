/*
  Warnings:

  - A unique constraint covering the columns `[wiki_data_id]` on the table `WorshipedPerson` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "WorshipedPerson_wiki_data_id_key" ON "WorshipedPerson"("wiki_data_id");
