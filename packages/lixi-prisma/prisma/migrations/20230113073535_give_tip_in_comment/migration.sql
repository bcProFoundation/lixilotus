-- CreateTable
CREATE TABLE "give_tip" (
    "id" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "from_address" TEXT NOT NULL,
    "from_account_id" TEXT NOT NULL,
    "to_address" TEXT NOT NULL,
    "to_account_id" TEXT NOT NULL,
    "comment_id" TEXT NOT NULL,
    "tip_value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "give_tip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "give_tip_comment_id_key" ON "give_tip"("comment_id");

-- AddForeignKey
ALTER TABLE "give_tip" ADD CONSTRAINT "give_tip_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
