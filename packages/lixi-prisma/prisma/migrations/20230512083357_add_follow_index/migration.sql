-- CreateIndex
CREATE INDEX "follow_account_follower_account_id_idx" ON "follow_account"("follower_account_id");

-- CreateIndex
CREATE INDEX "follow_account_following_account_id_idx" ON "follow_account"("following_account_id");

-- CreateIndex
CREATE INDEX "follow_page_account_id_idx" ON "follow_page"("account_id");

-- CreateIndex
CREATE INDEX "follow_page_page_id_idx" ON "follow_page"("page_id");
