-- AlterTable
ALTER TABLE "vault" ADD COLUMN     "envelope_id" INTEGER,
ADD COLUMN     "envelope_message" TEXT NOT NULL DEFAULT E'';

-- CreateTable
CREATE TABLE "Envelope" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL DEFAULT E'',

    CONSTRAINT "Envelope_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vault" ADD CONSTRAINT "vault_envelope_id_fkey" FOREIGN KEY ("envelope_id") REFERENCES "Envelope"("id") ON DELETE SET NULL ON UPDATE CASCADE;
