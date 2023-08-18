-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE');

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "messageType" "MessageType" DEFAULT 'TEXT',
ALTER COLUMN "body" DROP NOT NULL;
