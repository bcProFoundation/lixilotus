-- AlterTable
ALTER TABLE "upload" ADD COLUMN     "bucket" TEXT,
ALTER COLUMN "file_size" DROP NOT NULL,
ALTER COLUMN "url" DROP NOT NULL;
