-- CreateTable
CREATE TABLE "webpush_subscription" (
    "id" TEXT NOT NULL,
    "client_app_id" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "account_id" INTEGER,
    "address" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webpush_subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webpush_subscription_endpoint_idx" ON "webpush_subscription"("endpoint");

-- CreateIndex
CREATE INDEX "webpush_subscription_address_idx" ON "webpush_subscription"("address");

-- CreateIndex
CREATE INDEX "webpush_subscription_device_id_idx" ON "webpush_subscription"("device_id");

-- AddForeignKey
ALTER TABLE "webpush_subscription" ADD CONSTRAINT "webpush_subscription_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
