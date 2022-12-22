-- CreateTable
CREATE TABLE "comment" (
    "id" TEXT NOT NULL,
    "comment_account_id" INTEGER,
    "comment_by_public_key" TEXT,
    "comment_to_id" TEXT NOT NULL,
    "comment_text" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lotus_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lotus_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lotus_burn_score" DOUBLE PRECISION NOT NULL DEFAULT 0.0,

    CONSTRAINT "comment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "index_comment_on_account" ON "comment"("comment_account_id");

-- CreateIndex
CREATE INDEX "index_comment_by_public_key" ON "comment"("comment_by_public_key");

-- CreateIndex
CREATE INDEX "index_comment_on_post" ON "comment"("comment_to_id");

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_comment_account_id_fkey" FOREIGN KEY ("comment_account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comment" ADD CONSTRAINT "comment_comment_to_id_fkey" FOREIGN KEY ("comment_to_id") REFERENCES "post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
