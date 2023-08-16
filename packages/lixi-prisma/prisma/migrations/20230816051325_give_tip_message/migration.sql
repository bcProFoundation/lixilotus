-- CreateTable
CREATE TABLE "give_tip_messsage" (
    "id" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "from_address" TEXT NOT NULL,
    "from_account_id" INTEGER NOT NULL,
    "to_address" TEXT NOT NULL,
    "to_account_id" INTEGER NOT NULL,
    "message_id" TEXT NOT NULL,
    "tip_value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "give_tip_messsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "give_tip_messsage_message_id_key" ON "give_tip_messsage"("message_id");

-- AddForeignKey
ALTER TABLE "give_tip_messsage" ADD CONSTRAINT "give_tip_messsage_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
