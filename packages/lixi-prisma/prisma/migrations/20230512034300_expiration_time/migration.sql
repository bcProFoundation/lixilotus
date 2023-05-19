-- CreateIndex
CREATE INDEX "webpush_subscription_endpoint_p256dh_auth_idx" ON "webpush_subscription"("endpoint", "p256dh", "auth");
