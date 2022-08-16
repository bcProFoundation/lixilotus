-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "encrypted_mnemonic" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mnemonic_hash" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lixi" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "max_claim" INTEGER NOT NULL DEFAULT 0,
    "claimed_num" INTEGER NOT NULL DEFAULT 0,
    "claim_type" INTEGER NOT NULL DEFAULT 0,
    "lixi_type" INTEGER NOT NULL DEFAULT 0,
    "min_value" DOUBLE PRECISION NOT NULL,
    "max_value" DOUBLE PRECISION NOT NULL,
    "fixed_value" DOUBLE PRECISION NOT NULL,
    "divided_value" INTEGER NOT NULL DEFAULT 1,
    "encrypted_xpriv" TEXT NOT NULL,
    "encrypted_claim_code" TEXT NOT NULL,
    "total_claim" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_at" TIMESTAMPTZ,
    "country" TEXT,
    "is_family_friendly" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL DEFAULT E'active',
    "account_id" INTEGER NOT NULL,
    "derivation_index" INTEGER NOT NULL DEFAULT 0,
    "address" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sub_lixi_value" INTEGER,
    "parent_id" INTEGER,
    "envelope_id" INTEGER,
    "envelope_message" TEXT NOT NULL DEFAULT E'',
    "check_claim" BOOLEAN DEFAULT false,

    CONSTRAINT "lixi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "claim" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "claim_address" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "lixi_id" INTEGER NOT NULL,

    CONSTRAINT "claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "envelope" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "envelope_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_mnemonic_hash_idx" ON "account"("mnemonic_hash");

-- AddForeignKey
ALTER TABLE "lixi" ADD CONSTRAINT "lixi_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lixi" ADD CONSTRAINT "lixi_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lixi" ADD CONSTRAINT "lixi_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "envelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claim" ADD CONSTRAINT "claim_lixi_id_fkey" FOREIGN KEY ("lixi_id") REFERENCES "lixi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
