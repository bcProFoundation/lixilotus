-- CreateTable
CREATE TABLE "Vault" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isRandomGive" BOOLEAN NOT NULL,
    "minValue" DOUBLE PRECISION NOT NULL,
    "maxValue" DOUBLE PRECISION NOT NULL,
    "fixedValue" DOUBLE PRECISION NOT NULL,
    "encryptedMnemonic" TEXT NOT NULL,
    "totalRedeem" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vault_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redeem" (
    "id" SERIAL NOT NULL,
    "ipaddress" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "redeemAddress" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "vaultId" INTEGER NOT NULL,

    CONSTRAINT "Redeem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Redeem" ADD CONSTRAINT "Redeem_vaultId_fkey" FOREIGN KEY ("vaultId") REFERENCES "Vault"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
