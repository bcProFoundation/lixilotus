-- CreateEnum
CREATE TYPE "notification_level" AS ENUM ('DEBUG', 'INFO', 'WARNING', 'ERROR');

-- CreateTable
CREATE TABLE "notification_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "readAt" TIMESTAMPTZ,
    "deletedAt" TIMESTAMPTZ,
    "recipient_id" INTEGER,
    "sender_id" INTEGER,
    "additional_data" JSONB,
    "type_id" INTEGER NOT NULL,
    "level" "notification_level" NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT E'pending',
    "url" TEXT,
    "action" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "notification_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
