-- CreateTable
CREATE TABLE "follow_account" (
    "id" TEXT NOT NULL,
    "follower_account_id" INTEGER NOT NULL,
    "following_account_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_page" (
    "id" TEXT NOT NULL,
    "account_id" INTEGER NOT NULL,
    "page_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follow_page_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "follow_account" ADD CONSTRAINT "follow_account_follower_account_id_fkey" FOREIGN KEY ("follower_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_account" ADD CONSTRAINT "follow_account_following_account_id_fkey" FOREIGN KEY ("following_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_page" ADD CONSTRAINT "follow_page_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_page" ADD CONSTRAINT "follow_page_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
