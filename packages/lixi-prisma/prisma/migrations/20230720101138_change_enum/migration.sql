/*
  Warnings:

  - The values [ClOSE] on the enum `PageMessageSessionStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PageMessageSessionStatus_new" AS ENUM ('PENDING', 'OPEN', 'CLOSE');
ALTER TABLE "page_message_session" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "page_message_session" ALTER COLUMN "status" TYPE "PageMessageSessionStatus_new" USING ("status"::text::"PageMessageSessionStatus_new");
ALTER TYPE "PageMessageSessionStatus" RENAME TO "PageMessageSessionStatus_old";
ALTER TYPE "PageMessageSessionStatus_new" RENAME TO "PageMessageSessionStatus";
DROP TYPE "PageMessageSessionStatus_old";
ALTER TABLE "page_message_session" ALTER COLUMN "status" SET DEFAULT 'CLOSE';
COMMIT;

-- AlterTable
ALTER TABLE "page_message_session" ALTER COLUMN "status" SET DEFAULT 'CLOSE';
