-- AlterTable
ALTER TABLE "page" ADD COLUMN     "lotus_burn_down" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
ADD COLUMN     "lotus_burn_up" DECIMAL(65,30) NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "lotus_burn_down" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "lotus_burn_up" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- CreateTable
CREATE TABLE "Burn" (
    "id" TEXT NOT NULL,
    "txid" TEXT NOT NULL,
    "burn_type" BOOLEAN NOT NULL,
    "burn_for_type" INTEGER NOT NULL,
    "burned_by" BYTEA NOT NULL,
    "burned_for_id" TEXT NOT NULL,
    "burned_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Burn_pkey" PRIMARY KEY ("id")
);
