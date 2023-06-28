-- CreateTable
CREATE TABLE "post_translation" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "original_language" TEXT NOT NULL,
    "translate_language" TEXT NOT NULL,
    "translate_content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_translation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "post_translation" ADD CONSTRAINT "post_translation_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
