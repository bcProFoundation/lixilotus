-- AlterTable
ALTER TABLE "lixi" ADD COLUMN     "package_id" INTEGER,
ADD COLUMN     "package_value" INTEGER;

-- CreateTable
CREATE TABLE "package" (
    "id" SERIAL NOT NULL,
    "pack_code" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "package_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "lixi" ADD CONSTRAINT "lixi_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
