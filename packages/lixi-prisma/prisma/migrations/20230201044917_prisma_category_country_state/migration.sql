/*
  Warnings:

  - You are about to drop the column `country` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `page` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "page" DROP COLUMN "country",
DROP COLUMN "state",
ADD COLUMN     "category_id" INTEGER,
ADD COLUMN     "country_id" INTEGER,
ADD COLUMN     "state_id" INTEGER;

-- CreateTable
CREATE TABLE "category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "state"("id") ON DELETE SET NULL ON UPDATE CASCADE;
