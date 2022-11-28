-- CreateTable
CREATE TABLE "Burn" (
    "id" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "burn_type" BOOLEAN NOT NULL,
    "burn_for_type" INTEGER NOT NULL,
    "burned_by" BYTEA NOT NULL,
    "burned_for_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "Burn_pkey" PRIMARY KEY ("id")
);
