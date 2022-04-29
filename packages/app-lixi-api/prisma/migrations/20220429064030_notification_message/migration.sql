-- AlterTable
ALTER TABLE "notification" ADD COLUMN     "message" TEXT NOT NULL DEFAULT E'';

-- AlterTable
ALTER TABLE "notification_type" ALTER COLUMN "name" SET DEFAULT E'';
