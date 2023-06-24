-- CreateTable
CREATE TABLE "repost" (
    "id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "repost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "repost_account_id_idx" ON "repost"("account_id");

-- CreateIndex
CREATE INDEX "repost_post_id_idx" ON "repost"("post_id");

-- AddForeignKey
ALTER TABLE "repost" ADD CONSTRAINT "repost_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repost" ADD CONSTRAINT "repost_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
