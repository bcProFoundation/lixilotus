-- CreateTable
CREATE TABLE "account" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "encrypted_mnemonic" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mnemonic_hash" TEXT NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vault" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "max_redeem" INTEGER NOT NULL DEFAULT 0,
    "redeemed_num" INTEGER NOT NULL DEFAULT 0,
    "vault_type" INTEGER NOT NULL DEFAULT 0,
    "min_value" DOUBLE PRECISION NOT NULL,
    "max_value" DOUBLE PRECISION NOT NULL,
    "fixed_value" DOUBLE PRECISION NOT NULL,
    "divided_value" INTEGER NOT NULL DEFAULT 1,
    "encrypted_xpriv" TEXT NOT NULL,
    "total_redeem" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_at" TIMESTAMP(3),
    "country" TEXT,
    "status" TEXT NOT NULL DEFAULT E'active',
    "account_id" INTEGER NOT NULL,
    "derivation_index" INTEGER NOT NULL DEFAULT 0,
    "expiry_time" TIMESTAMPTZ,
    "address" TEXT NOT NULL,

    CONSTRAINT "vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redeem" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeem_address" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "vault_id" INTEGER NOT NULL,

    CONSTRAINT "redeem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_mnemonic_hash_idx" ON "account"("mnemonic_hash");

-- AddForeignKey
ALTER TABLE "vault" ADD CONSTRAINT "vault_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redeem" ADD CONSTRAINT "redeem_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
