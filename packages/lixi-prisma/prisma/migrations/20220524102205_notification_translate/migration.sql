/*
  Warnings:

  - You are about to drop the column `template` on the `notification_type` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "notification_type" DROP COLUMN "template";

-- CreateTable
CREATE TABLE "notification_type_translation" (
    "id" SERIAL NOT NULL,
    "notificationType_Id" INTEGER NOT NULL,
    "language" TEXT NOT NULL,
    "is_default" BOOLEAN,
    "template" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_type_translation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification_type_translation" ADD CONSTRAINT "notification_type_translation_notificationType_Id_fkey" FOREIGN KEY ("notificationType_Id") REFERENCES "notification_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
