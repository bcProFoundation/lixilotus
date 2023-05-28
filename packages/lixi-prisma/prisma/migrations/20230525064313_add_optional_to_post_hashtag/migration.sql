-- DropForeignKey
ALTER TABLE "post_hashtag" DROP CONSTRAINT "post_hashtag_postId_fkey";

-- AlterTable
ALTER TABLE "post_hashtag" ALTER COLUMN "postId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "post_hashtag" ADD CONSTRAINT "post_hashtag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
