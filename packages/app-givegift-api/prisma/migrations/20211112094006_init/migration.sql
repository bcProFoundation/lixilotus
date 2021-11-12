-- CreateTable
CREATE TABLE "vault" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_random_give" BOOLEAN NOT NULL,
    "min_value" DOUBLE PRECISION NOT NULL,
    "max_value" DOUBLE PRECISION NOT NULL,
    "fixed_value" DOUBLE PRECISION NOT NULL,
    "encrypted_mnemonic" TEXT NOT NULL,
    "total_redeem" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redeem" (
    "id" SERIAL NOT NULL,
    "ip_address" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeem_address" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "vault_id" INTEGER NOT NULL,

    CONSTRAINT "redeem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "redeem" ADD CONSTRAINT "redeem_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
