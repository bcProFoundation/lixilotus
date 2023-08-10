-- AlterTable
ALTER TABLE "page" ADD COLUMN     "access_chat_fee" DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN     "followerFreeMessage" BOOLEAN DEFAULT false,
ADD COLUMN     "min_dana_for_message" DOUBLE PRECISION DEFAULT 0.0;

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "isPageOwner" BOOLEAN,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageSessionId" TEXT,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_message_session" (
    "id" TEXT NOT NULL,
    "pageId" TEXT,
    "accountId" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_message_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_session" (
    "id" TEXT NOT NULL,
    "pageMessageSessionId" TEXT,
    "lixiId" INTEGER,
    "lixi_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sessionOpen" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_session_lixiId_key" ON "message_session"("lixiId");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_messageSessionId_fkey" FOREIGN KEY ("messageSessionId") REFERENCES "message_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "page"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_message_session" ADD CONSTRAINT "page_message_session_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_session" ADD CONSTRAINT "message_session_pageMessageSessionId_fkey" FOREIGN KEY ("pageMessageSessionId") REFERENCES "page_message_session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_session" ADD CONSTRAINT "message_session_lixiId_fkey" FOREIGN KEY ("lixiId") REFERENCES "lixi"("id") ON DELETE SET NULL ON UPDATE CASCADE;
