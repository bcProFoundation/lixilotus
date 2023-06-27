-- AlterTable
ALTER TABLE "post_translation" ALTER COLUMN "translate_language" DROP NOT NULL,
ALTER COLUMN "translate_content" DROP NOT NULL;
