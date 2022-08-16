/*
  Warnings:

  - You are about to drop the column `notificationType_Id` on the `notification_type_translation` table. All the data in the column will be lost.
  - Added the required column `notification_type_id` to the `notification_type_translation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "notification_type_translation" DROP CONSTRAINT "notification_type_translation_notificationType_Id_fkey";

-- AlterTable
ALTER TABLE "notification_type_translation" DROP COLUMN "notificationType_Id",
ADD COLUMN     "notification_type_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "notification_type_translation" ADD CONSTRAINT "notification_type_translation_notification_type_id_fkey" FOREIGN KEY ("notification_type_id") REFERENCES "notification_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
