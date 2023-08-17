-- AlterTable
ALTER TABLE "account" ADD COLUMN     "birthday" TIMESTAMPTZ(6),
ADD COLUMN     "create_comment_fee" TEXT NOT NULL DEFAULT '0.00055',
ADD COLUMN     "day_of_birth" INTEGER,
ADD COLUMN     "description" VARCHAR(1000) NOT NULL DEFAULT '',
ADD COLUMN     "month_of_birth" INTEGER,
ADD COLUMN     "website" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "year_of_birth" INTEGER;
