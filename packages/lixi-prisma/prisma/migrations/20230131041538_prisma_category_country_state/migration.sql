/*
  Warnings:

  - You are about to drop the column `category` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `page` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `page` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `page` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "page" DROP COLUMN "category",
DROP COLUMN "country",
DROP COLUMN "state",
ADD COLUMN     "category_id" INTEGER NOT NULL,
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
ALTER TABLE "page" ADD CONSTRAINT "page_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "state"("id") ON DELETE SET NULL ON UPDATE CASCADE;
