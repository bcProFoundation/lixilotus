-- AlterTable
ALTER TABLE "page" ADD COLUMN     "total_posts_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "total_posts_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "total_posts_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0;
